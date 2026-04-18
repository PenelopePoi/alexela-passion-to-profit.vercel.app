import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAuth(req.headers.authorization);

    const { clientId } = req.body as { clientId: string };

    if (!clientId) {
      return res.status(400).json({ error: 'Missing required field: clientId' });
    }

    // Fetch all invoices for this client
    const invoiceSnap = await db
      .collection('invoices')
      .where('clientId', '==', clientId)
      .get();

    let totalBilled = 0;
    let totalPaid = 0;
    let overdueAmount = 0;
    let lastPaymentDate: number | null = null;
    let clientName = '';
    let clientEmail = '';
    const now = Date.now();

    invoiceSnap.docs.forEach((doc) => {
      const inv = doc.data();

      // Capture client info from the first invoice
      if (!clientName && inv.clientName) clientName = inv.clientName;
      if (!clientEmail && inv.clientEmail) clientEmail = inv.clientEmail;

      // Skip voided invoices from totals
      if (inv.status === 'void' || inv.status === 'written_off') return;

      totalBilled += inv.total || 0;
      totalPaid += inv.amountPaid || 0;

      // Check overdue: sent or partially_paid and past due date
      if (
        ['sent', 'viewed', 'partially_paid', 'overdue'].includes(inv.status) &&
        inv.dueDate < now &&
        inv.amountDue > 0
      ) {
        overdueAmount += inv.amountDue;
      }

      // Track last payment
      if (inv.paidDate && (lastPaymentDate === null || inv.paidDate > lastPaymentDate)) {
        lastPaymentDate = inv.paidDate;
      }
    });

    // Also check transactions for payment dates
    const txSnap = await db
      .collection('transactions')
      .where('clientId', '==', clientId)
      .where('type', '==', 'revenue')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!txSnap.empty) {
      const latestTx = txSnap.docs[0].data();
      if (lastPaymentDate === null || latestTx.createdAt > lastPaymentDate) {
        lastPaymentDate = latestTx.createdAt;
      }
    }

    // Count active subscriptions
    const subSnap = await db
      .collection('subscriptions')
      .where('clientId', '==', clientId)
      .where('status', '==', 'active')
      .get();

    // Count active payment plans
    const planSnap = await db
      .collection('paymentPlans')
      .where('clientId', '==', clientId)
      .where('status', '==', 'active')
      .get();

    const balance: Record<string, unknown> = {
      clientId,
      clientName,
      clientEmail,
      totalBilled,
      totalPaid,
      balance: totalBilled - totalPaid, // positive = client owes
      overdueAmount,
      lastPaymentDate,
      activeSubscriptions: subSnap.size,
      activePaymentPlans: planSnap.size,
    };

    return res.json(balance);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Authorization')) {
      return res.status(401).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
}
