import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireEnv } from '../_lib/validateEnv';
import { handleCors } from '../_lib/cors';

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, returnUrl } = req.body;

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
