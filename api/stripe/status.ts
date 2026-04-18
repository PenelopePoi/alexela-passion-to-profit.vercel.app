import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireEnv } from '../_lib/validateEnv';
import { handleCors } from '../_lib/cors';

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.query.session_id as string;
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'Valid session_id required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.json({
      sessionId: session.id,
      status: session.payment_status === 'paid' ? 'succeeded' : session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
