import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { handleCors } from '../_lib/cors.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) return res.status(503).json({ error: 'The billing portal is not configured.' });

  const { customerId, returnUrl } = req.body || {};

  if (!customerId || !customerId.startsWith('cus_')) {
    return res.status(400).json({ error: 'Valid Stripe customer ID required' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || req.headers.origin || 'https://xela-creative-branding.vercel.app',
    });

    return res.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
