import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req.headers.authorization);

    const {
      type,
      amount,
      currency = 'usd',
      description,
      clientId = null,
      invoiceId = null,
      stripePaymentIntentId = null,
      paymentMethod,
      category = null,
      metadata = {},
    } = req.body;

    // Validate required fields
    if (!type || amount === undefined || !description || !paymentMethod) {
      return res.status(400).json({
        error: 'Missing required fields: type, amount, description, paymentMethod',
      });
    }

    const validTypes = ['revenue', 'expense', 'refund', 'tax_payment', 'transfer', 'adjustment'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid transaction type: ${type}` });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number (in cents)' });
    }

    const now = Date.now();
    const docRef = db.collection('transactions').doc();

    const transaction = {
      id: docRef.id,
      type,
      amount: Math.round(amount),
      currency,
      description,
      clientId,
      invoiceId,
      stripePaymentIntentId,
      paymentMethod,
      category,
      metadata: {
        ...metadata,
        recordedBy: user.uid,
      },
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(transaction);

    return res.json(transaction);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record transaction';
    const status = message.includes('Authorization') ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
