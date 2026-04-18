import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

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

    // Query revenue transactions in the date range
    const snapshot = await db
      .collection('transactions')
      .where('type', '==', 'revenue')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    const packageRevenue: Record<string, number> = {
      budget: 0,
      premium: 0,
      elite: 0,
    };

    const retainerRevenue: Record<string, number> = {
      basic: 0,
      standard: 0,
      premium: 0,
    };

    let otherRevenue = 0;
    let totalRevenue = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const amount = data.amount || 0;
      totalRevenue += amount;

      const tier = data.metadata?.packageTier;
      const retainer = data.metadata?.retainerTier;

      if (tier && tier in packageRevenue) {
        packageRevenue[tier] += amount;
      } else if (retainer && retainer in retainerRevenue) {
        retainerRevenue[retainer] += amount;
      } else {
        otherRevenue += amount;
      }
    }

    const breakdown = {
      packageRevenue,
      retainerRevenue,
      otherRevenue,
      totalRevenue,
    };

    return res.json(breakdown);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate revenue report';
    const status = message.includes('Authorization') ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
