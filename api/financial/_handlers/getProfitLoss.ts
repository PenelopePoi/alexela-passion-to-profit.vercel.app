import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

const EXPENSE_CATEGORIES = [
  'software', 'hosting', 'ai_compute', 'marketing', 'contractor',
  'office', 'taxes', 'insurance', 'professional_services', 'supplies', 'other',
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAuth(req.headers.authorization);

    const { startDate, endDate, label } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required (Unix ms)' });
    }

    // Fetch all transactions in the date range
    const txSnapshot = await db
      .collection('transactions')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    // Revenue breakdown
    const packageRevenue: Record<string, number> = { budget: 0, premium: 0, elite: 0 };
    const retainerRevenue: Record<string, number> = { basic: 0, standard: 0, premium: 0 };
    let otherRevenue = 0;
    let totalRevenue = 0;

    // Expense breakdown
    const byCategory: Record<string, number> = {};
    for (const cat of EXPENSE_CATEGORIES) {
      byCategory[cat] = 0;
    }
    let totalExpenses = 0;

    let transactionCount = 0;

    for (const doc of txSnapshot.docs) {
      const data = doc.data();
      const amount = data.amount || 0;
      transactionCount++;

      if (data.type === 'revenue') {
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
      } else if (data.type === 'expense') {
        totalExpenses += amount;
        const category = data.category || 'other';
        if (category in byCategory) {
          byCategory[category] += amount;
        } else {
          byCategory['other'] += amount;
        }
      } else if (data.type === 'refund') {
        // Refunds reduce revenue
        totalRevenue -= amount;
        otherRevenue -= amount;
      }
    }

    // Count invoices in the period
    const invoiceSnapshot = await db
      .collection('invoices')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    // Calculate outstanding receivables (invoices not fully paid)
    let outstandingReceivables = 0;
    for (const doc of invoiceSnapshot.docs) {
      const inv = doc.data();
      const due = inv.amountDue || 0;
      if (due > 0 && inv.status !== 'void' && inv.status !== 'written_off') {
        outstandingReceivables += due;
      }
    }

    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = grossProfit; // No additional deductions for now
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 10000) / 100 : 0;

    const periodLabel =
      label ||
      `${new Date(startDate).toLocaleDateString('en-US')} — ${new Date(endDate).toLocaleDateString('en-US')}`;

    const report = {
      period: {
        startDate,
        endDate,
        label: periodLabel,
      },
      revenue: {
        packageRevenue,
        retainerRevenue,
        otherRevenue,
        totalRevenue,
      },
      expenses: {
        byCategory,
        totalExpenses,
      },
      grossProfit,
      netProfit,
      profitMargin,
      transactionCount,
      invoiceCount: invoiceSnapshot.size,
      outstandingReceivables,
      generatedAt: Date.now(),
    };

    return res.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate P&L report';
    const status = message.includes('Authorization') ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
