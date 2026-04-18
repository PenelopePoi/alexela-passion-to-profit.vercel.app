import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

const EXPENSE_CATEGORIES = [
  'software',
  'hosting',
  'ai_compute',
  'marketing',
  'contractor',
  'office',
  'taxes',
  'insurance',
  'professional_services',
  'supplies',
  'other',
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAuth(req.headers.authorization);

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required (Unix ms)' });
    }

    // Query expense transactions in the date range
    const snapshot = await db
      .collection('transactions')
      .where('type', '==', 'expense')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    // Initialize all categories to 0
    const byCategory: Record<string, number> = {};
    for (const cat of EXPENSE_CATEGORIES) {
      byCategory[cat] = 0;
    }

    let totalExpenses = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const amount = data.amount || 0;
      totalExpenses += amount;

      const category = data.category || 'other';
      if (category in byCategory) {
        byCategory[category] += amount;
      } else {
        byCategory['other'] += amount;
      }
    }

    const breakdown = {
      byCategory,
      totalExpenses,
    };

    return res.json(breakdown);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate expense report';
    const status = message.includes('Authorization') ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
