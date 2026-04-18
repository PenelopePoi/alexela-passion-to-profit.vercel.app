import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthRange(year: number, month: number): { start: number; end: number } {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAuth(req.headers.authorization);

    const { months: forecastMonths = 6 } = req.body;

    const numMonths = Math.min(Math.max(forecastMonths, 1), 24);

    // Gather last 3 months of historical data for projections
    const now = new Date();
    const historicalMonths = 3;
    const histRevenue: number[] = [];
    const histExpenses: number[] = [];

    for (let i = historicalMonths; i >= 1; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = getMonthRange(d.getFullYear(), d.getMonth());

      const [revSnap, expSnap] = await Promise.all([
        db.collection('transactions')
          .where('type', '==', 'revenue')
          .where('createdAt', '>=', start)
          .where('createdAt', '<=', end)
          .get(),
        db.collection('transactions')
          .where('type', '==', 'expense')
          .where('createdAt', '>=', start)
          .where('createdAt', '<=', end)
          .get(),
      ]);

      let monthRevenue = 0;
      for (const doc of revSnap.docs) {
        monthRevenue += doc.data().amount || 0;
      }
      histRevenue.push(monthRevenue);

      let monthExpenses = 0;
      for (const doc of expSnap.docs) {
        monthExpenses += doc.data().amount || 0;
      }
      histExpenses.push(monthExpenses);
    }

    // Count active subscriptions
    const subsSnapshot = await db
      .collection('subscriptions')
      .where('status', '==', 'active')
      .get();

    const activeSubscriptions = subsSnapshot.size;
    let monthlyRecurring = 0;
    for (const doc of subsSnapshot.docs) {
      const sub = doc.data();
      if (sub.interval === 'year') {
        monthlyRecurring += Math.round((sub.amount || 0) / 12);
      } else {
        monthlyRecurring += sub.amount || 0;
      }
    }

    // Count expected payments from active payment plans
    const plansSnapshot = await db
      .collection('payment_plans')
      .where('status', '==', 'active')
      .get();

    const expectedPayments = plansSnapshot.size;
    let monthlyPlanRevenue = 0;
    for (const doc of plansSnapshot.docs) {
      monthlyPlanRevenue += doc.data().installmentAmount || 0;
    }

    // Calculate averages from historical data, falling back to recurring revenue
    const avgRevenue =
      histRevenue.length > 0 && histRevenue.some((r) => r > 0)
        ? Math.round(histRevenue.reduce((a, b) => a + b, 0) / histRevenue.length)
        : monthlyRecurring + monthlyPlanRevenue;

    const avgExpenses =
      histExpenses.length > 0 && histExpenses.some((e) => e > 0)
        ? Math.round(histExpenses.reduce((a, b) => a + b, 0) / histExpenses.length)
        : 0;

    // Apply a modest 5% monthly growth projection on revenue
    const growthRate = 0.05;
    const months = [];
    let cumulativeCashFlow = 0;
    let totalProjectedRevenue = 0;
    let totalProjectedExpenses = 0;

    for (let i = 0; i < numMonths; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const growthMultiplier = Math.pow(1 + growthRate, i);
      const projectedRevenue = Math.round((avgRevenue + monthlyRecurring) * growthMultiplier);
      // Expenses grow slower — 2% monthly
      const projectedExpenses = Math.round(avgExpenses * Math.pow(1.02, i));
      const netCashFlow = projectedRevenue - projectedExpenses;
      cumulativeCashFlow += netCashFlow;

      totalProjectedRevenue += projectedRevenue;
      totalProjectedExpenses += projectedExpenses;

      months.push({
        month: formatMonth(d),
        projectedRevenue,
        projectedExpenses,
        netCashFlow,
        cumulativeCashFlow,
        activeSubscriptions,
        expectedPayments,
      });
    }

    const assumptions = [
      `Based on ${historicalMonths}-month historical average`,
      `${(growthRate * 100).toFixed(0)}% monthly revenue growth projection`,
      `2% monthly expense growth projection`,
      `${activeSubscriptions} active subscriptions ($${(monthlyRecurring / 100).toFixed(2)}/mo recurring)`,
      `${expectedPayments} active payment plans`,
      'Florida — no state income tax',
    ];

    const forecast = {
      months,
      totalProjectedRevenue,
      totalProjectedExpenses,
      projectedNetCashFlow: totalProjectedRevenue - totalProjectedExpenses,
      assumptions,
      generatedAt: Date.now(),
    };

    return res.json(forecast);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate cash flow forecast';
    const status = message.includes('Authorization') ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
