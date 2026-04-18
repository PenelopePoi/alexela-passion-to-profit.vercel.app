import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireEnv } from '../_lib/validateEnv';
import { handleCors } from '../_lib/cors';

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));

/** Individual package prices in cents — matches Pricing.tsx exactly */
const PACKAGE_PRICES: Record<string, { amount: number; name: string }> = {
  // Budget tier: $75-175
  cardcut:    { amount: 7500,   name: 'CardCut Calibrated' },
  promo:      { amount: 12500,  name: 'Promotion Pal' },
  sticker:    { amount: 17500,  name: 'Sticker System' },
  // Premium tier: $350-650
  sales:      { amount: 35000,  name: 'Selling Sales Set' },
  rebellion:  { amount: 50000,  name: 'Registered Rebellion' },
  passion:    { amount: 65000,  name: 'Premiere Passion Pal' },
  // Elite tier: $850-2000
  sovereign:  { amount: 85000,  name: 'The Sovereignty Set' },
  site:       { amount: 120000, name: 'Site Sales Solution' },
  enterprise: { amount: 150000, name: 'Entrepreneurship Enterprise' },
  ultimate:   { amount: 200000, name: 'Ultimate Premium Suite' },
  // Legacy tier keys still accepted (maps to starting price)
  budget:     { amount: 7500,   name: 'Budget Starter Package' },
  premium:    { amount: 35000,  name: 'Premium Brand Package' },
  elite:      { amount: 85000,  name: 'Elite Identity Package' },
};

const RETAINER_PRICES: Record<string, { amount: number; name: string; interval: 'month' }> = {
  basic:    { amount: 9900,  name: 'Google Business Retainer', interval: 'month' },
  standard: { amount: 15000, name: 'Social Media Retainer', interval: 'month' },
  premium:  { amount: 19900, name: 'FB + Nextdoor Ads Retainer', interval: 'month' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { packageTier, customerEmail, successUrl, cancelUrl, mode, retainerTier, installments } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // Subscription mode (retainers)
    if (mode === 'subscription' && retainerTier) {
      const retainer = RETAINER_PRICES[retainerTier];
      if (!retainer) {
        return res.status(400).json({ error: `Invalid retainer tier: ${retainerTier}` });
      }

      const price = await stripe.prices.create({
        unit_amount: retainer.amount,
        currency: 'usd',
        recurring: { interval: retainer.interval },
        product_data: { name: retainer.name },
      });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: customerEmail,
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: successUrl || `${req.headers.origin}/?view=payment-success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/?view=payment-canceled`,
        metadata: { retainerTier },
      });

      return res.json({ sessionId: session.id, url: session.url });
    }

    // Payment plan mode (installments)
    if (mode === 'payment_plan' && packageTier && installments) {
      const pkg = PACKAGE_PRICES[packageTier];
      if (!pkg) {
        return res.status(400).json({ error: `Invalid package tier: ${packageTier}` });
      }

      const numInstallments = Math.min(Math.max(parseInt(installments, 10), 2), 4);
      const installmentAmount = Math.ceil(pkg.amount / numInstallments);

      const price = await stripe.prices.create({
        unit_amount: installmentAmount,
        currency: 'usd',
        recurring: { interval: 'month', interval_count: 1 },
        product_data: { name: `${pkg.name} — ${numInstallments} payments` },
      });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: customerEmail,
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: successUrl || `${req.headers.origin}/?view=payment-success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/?view=payment-canceled`,
        subscription_data: {
          metadata: {
            packageTier,
            totalAmount: String(pkg.amount),
            installments: String(numInstallments),
            type: 'payment_plan',
          },
        },
      });

      return res.json({ sessionId: session.id, url: session.url });
    }

    // One-time payment mode (default)
    const pkg = PACKAGE_PRICES[packageTier];
    if (!pkg) {
      return res.status(400).json({ error: `Invalid package tier: ${packageTier}` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: pkg.name },
            unit_amount: pkg.amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.origin}/?view=payment-success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/?view=payment-canceled`,
      metadata: { packageTier },
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
