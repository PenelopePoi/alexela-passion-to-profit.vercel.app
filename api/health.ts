/**
 * Health Check Endpoint — XELA Creative Branding Studio
 * Returns service availability based on whether env vars are configured.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const firebaseConfigured = !!(
    process.env.FIREBASE_PROJECT_ID &&
    (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS)
  );

  const stripeConfigured = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET
  );

  const geminiConfigured = !!process.env.GEMINI_API_KEY;

  const allHealthy = firebaseConfigured && stripeConfigured && geminiConfigured;

  return res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    services: {
      firebase: firebaseConfigured,
      stripe: stripeConfigured,
      gemini: geminiConfigured,
    },
    timestamp: new Date().toISOString(),
  });
}
