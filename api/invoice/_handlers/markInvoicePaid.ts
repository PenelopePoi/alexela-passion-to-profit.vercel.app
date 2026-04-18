import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req.headers.authorization);

    const {
      invoiceId,
      amountPaid,
      paymentMethod,
      stripePaymentIntentId,
      notes,
    } = req.body as {
      invoiceId: string;
      amountPaid?: number;
      paymentMethod?: string;
      stripePaymentIntentId?: string;
      notes?: string;
    };

    if (!invoiceId) {
      return res.status(400).json({ error: 'Missing required field: invoiceId' });
    }

    const docRef = db.collection('invoices').doc(invoiceId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = snap.data()!;

    // Cannot mark void or written-off invoices as paid
    if (invoice.status === 'void' || invoice.status === 'written_off') {
      return res.status(400).json({
        error: `Cannot mark invoice with status "${invoice.status}" as paid.`,
      });
    }

    const now = Date.now();
    const payment = amountPaid ?? invoice.amountDue;
    const newAmountPaid = invoice.amountPaid + payment;
    const newAmountDue = Math.max(0, invoice.total - newAmountPaid);
    const fullyPaid = newAmountDue === 0;

    const updateData: Record<string, unknown> = {
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: fullyPaid ? 'paid' : 'partially_paid',
      paidDate: fullyPaid ? now : invoice.paidDate,
      paymentMethod: paymentMethod || invoice.paymentMethod,
      updatedAt: now,
    };

    if (stripePaymentIntentId) {
      updateData.stripePaymentIntentId = stripePaymentIntentId;
    }

    await docRef.update(updateData);

    // Record the payment as a transaction
    const txData = {
      type: 'revenue',
      amount: payment,
      currency: 'usd',
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      clientId: invoice.clientId,
      invoiceId,
      stripePaymentIntentId: stripePaymentIntentId || null,
      paymentMethod: paymentMethod || 'other',
      category: null,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        recordedBy: user.uid,
        ...(notes ? { notes } : {}),
      },
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('transactions').add(txData);

    return res.json({
      id: invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      status: fullyPaid ? 'paid' : 'partially_paid',
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      paymentRecorded: payment,
      paidDate: fullyPaid ? now : null,
      updatedAt: now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Authorization')) {
      return res.status(401).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
}
