import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireEnv } from '../_lib/validateEnv';
import { db } from '../_lib/auth';

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// ─── Event Handlers ─────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const txData = {
    type: 'revenue',
    amount: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
    description: `Checkout completed — ${session.metadata?.packageTier ?? 'unknown package'}`,
    clientId: null,
    clientEmail: session.customer_email ?? null,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === 'string' ? session.payment_intent : null,
    stripeCustomerId:
      typeof session.customer === 'string' ? session.customer : null,
    paymentMethod: 'stripe',
    metadata: session.metadata ?? {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection('transactions').add(txData);
  console.log(`[webhook] Transaction saved for session ${session.id}, amount: ${session.amount_total}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const stripeInvoiceId = invoice.id;

  // Find matching invoice in Firestore by Stripe invoice ID
  const snapshot = await db
    .collection('invoices')
    .where('stripeInvoiceId', '==', stripeInvoiceId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    await doc.ref.update({
      status: 'paid',
      paidDate: new Date(),
      amountPaid: invoice.amount_paid ?? 0,
      amountDue: 0,
      updatedAt: new Date(),
    });
    console.log(`[webhook] Invoice ${stripeInvoiceId} marked as paid`);
  } else {
    // No matching Firestore invoice — log the payment as a transaction
    await db.collection('transactions').add({
      type: 'revenue',
      amount: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? 'usd',
      description: `Invoice paid: ${stripeInvoiceId}`,
      stripeInvoiceId,
      stripeSubscriptionId: (invoice as any).subscription ?? null,
      clientEmail: invoice.customer_email ?? null,
      paymentMethod: 'stripe',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`[webhook] Invoice ${stripeInvoiceId} paid — no Firestore invoice found, logged as transaction`);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const stripeInvoiceId = invoice.id;

  const snapshot = await db
    .collection('invoices')
    .where('stripeInvoiceId', '==', stripeInvoiceId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    await doc.ref.update({
      status: 'overdue',
      updatedAt: new Date(),
    });
  }

  // Log failed payment attempt
  await db.collection('payment_events').add({
    event: 'invoice.payment_failed',
    stripeInvoiceId,
    stripeSubscriptionId: (invoice as any).subscription ?? null,
    customerEmail: invoice.customer_email ?? null,
    amount: invoice.amount_due ?? 0,
    currency: invoice.currency ?? 'usd',
    createdAt: new Date(),
  });

  console.log(`[webhook] Payment failed for invoice ${stripeInvoiceId}`);
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  eventType: string
): Promise<void> {
  const subData = {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId:
      typeof subscription.customer === 'string' ? subscription.customer : null,
    status: subscription.status,
    currentPeriodStart: (subscription as any).current_period_start
      ? new Date((subscription as any).current_period_start * 1000)
      : null,
    currentPeriodEnd: (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    metadata: subscription.metadata ?? {},
    updatedAt: new Date(),
  };

  // Upsert subscription in Firestore
  const snapshot = await db
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update(subData);
  } else if (eventType === 'customer.subscription.created') {
    await db.collection('subscriptions').add({
      ...subData,
      createdAt: new Date(),
    });
  }

  // Log the event
  await db.collection('subscription_events').add({
    event: eventType,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    metadata: subscription.metadata ?? {},
    createdAt: new Date(),
  });

  console.log(`[webhook] Subscription ${eventType}: ${subscription.id}, status: ${subscription.status}`);
}

// ─── Main Handler ───────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed';
    console.error(`[webhook] Verification failed: ${message}`);
    return res.status(400).json({ error: message });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Auto-cancel payment plans when all installments are paid
        const meta = subscription.metadata;
        if (meta.type === 'payment_plan' && event.type === 'customer.subscription.updated') {
          const totalPaid = meta.paidInstallments
            ? parseInt(meta.paidInstallments, 10) + 1
            : 1;
          const totalInstallments = parseInt(meta.installments, 10);

          if (totalPaid >= totalInstallments) {
            await stripe.subscriptions.cancel(subscription.id);
            console.log(`[webhook] Payment plan completed: ${subscription.id}`);
          } else {
            await stripe.subscriptions.update(subscription.id, {
              metadata: { ...meta, paidInstallments: String(totalPaid) },
            });
          }
        }

        await handleSubscriptionChange(subscription, event.type);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, event.type);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Event processing failed';
    console.error(`[webhook] Error processing ${event.type}: ${message}`);
    // Return 200 anyway so Stripe doesn't retry — the event was valid, just processing failed
    // Log it for investigation
    try {
      await db.collection('webhook_errors').add({
        eventType: event.type,
        eventId: event.id,
        error: message,
        createdAt: new Date(),
      });
    } catch {
      // Silent — don't fail the webhook response over error logging
    }
  }

  return res.json({ received: true });
}
