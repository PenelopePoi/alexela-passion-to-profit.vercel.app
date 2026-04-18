import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

// Florida has no state income tax — federal self-employment rate
const DEFAULT_TAX_RATE = 30; // 30% reserve (federal income + SE tax)

// Federal estimated tax due dates
function getQuarterlyDueDates(year: number) {
  return [
    { quarter: `Q1 ${year}`, dueDate: new Date(`${year}-04-15`).getTime() },
    { quarter: `Q2 ${year}`, dueDate: new Date(`${year}-06-15`).getTime() },
    { quarter: `Q3 ${year}`, dueDate: new Date(`${year}-09-15`).getTime() },
    { quarter: `Q4 ${year}`, dueDate: new Date(`${year + 1}-01-15`).getTime() },
  ];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAuth(req.headers.authorization);

    const { startDate, endDate, taxRate = DEFAULT_TAX_RATE } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required (Unix ms)' });
    }

    // Get total revenue in the period
    const revenueSnapshot = await db
      .collection('transactions')
      .where('type', '==', 'revenue')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    let totalRevenue = 0;
    for (const doc of revenueSnapshot.docs) {
      totalRevenue += doc.data().amount || 0;
    }

    // Subtract refunds
    const refundSnapshot = await db
      .collection('transactions')
      .where('type', '==', 'refund')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    for (const doc of refundSnapshot.docs) {
      totalRevenue -= doc.data().amount || 0;
    }

    // Get tax payments already made in the period
    const taxPaymentSnapshot = await db
      .collection('transactions')
      .where('type', '==', 'tax_payment')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    let paidToDate = 0;
    for (const doc of taxPaymentSnapshot.docs) {
      paidToDate += doc.data().amount || 0;
    }

    const reserveAmount = Math.round(totalRevenue * (taxRate / 100));
    const remainingReserve = Math.max(0, reserveAmount - paidToDate);

    // Build quarterly estimates for the year
    const startYear = new Date(startDate).getFullYear();
    const dueDates = getQuarterlyDueDates(startYear);
    const quarterlyEstimateAmount = Math.round(reserveAmount / 4);

    // Check which quarterly payments have been made
    const quarterlyEstimates = await Promise.all(
      dueDates.map(async ({ quarter, dueDate }) => {
        // Look for tax payments tagged for this quarter
        const qSnapshot = await db
          .collection('transactions')
          .where('type', '==', 'tax_payment')
          .where('metadata.quarter', '==', quarter)
          .get();

        let qPaid = 0;
        let paidDate: number | null = null;
        for (const doc of qSnapshot.docs) {
          qPaid += doc.data().amount || 0;
          paidDate = doc.data().createdAt;
        }

        return {
          quarter,
          estimatedTax: quarterlyEstimateAmount,
          dueDate,
          paid: qPaid >= quarterlyEstimateAmount,
          paidAmount: qPaid,
          paidDate,
        };
      })
    );

    const taxReserve = {
      period: { startDate, endDate },
      totalRevenue,
      taxRate,
      reserveAmount,
      paidToDate,
      remainingReserve,
      quarterlyEstimates,
    };

    return res.json(taxReserve);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to calculate tax reserve';
    const status = message.includes('Authorization') ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
