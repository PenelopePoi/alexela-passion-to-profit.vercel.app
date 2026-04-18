import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number; // cents
  taxRate: number;   // percentage, e.g. 7.5
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req.headers.authorization);

    const {
      clientId,
      clientName,
      clientEmail,
      clientAddress,
      lineItems,
      dueDate,
      notes,
      terms,
    } = req.body as {
      clientId: string;
      clientName: string;
      clientEmail: string;
      clientAddress?: string;
      lineItems: LineItemInput[];
      dueDate: number;
      notes?: string;
      terms?: string;
    };

    // Validate required fields
    if (!clientId || !clientName || !clientEmail || !lineItems?.length || !dueDate) {
      return res.status(400).json({
        error: 'Missing required fields: clientId, clientName, clientEmail, lineItems, dueDate',
      });
    }

    // Calculate totals for each line item
    const computedItems = lineItems.map((item) => {
      const lineTotal = Math.round(item.quantity * item.unitPrice);
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        total: lineTotal,
      };
    });

    const subtotal = computedItems.reduce((sum, item) => sum + item.total, 0);
    const taxTotal = computedItems.reduce(
      (sum, item) => sum + Math.round(item.total * (item.taxRate / 100)),
      0
    );
    const total = subtotal + taxTotal;

    // Generate invoice number: XELA-YYYY-NNNN
    const year = new Date().getFullYear();
    const counterRef = db.collection('_counters').doc('invoices');
    const invoiceNumber = await db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const current = snap.exists ? (snap.data()?.seq as number) || 0 : 0;
      const next = current + 1;
      tx.set(counterRef, { seq: next }, { merge: true });
      return `XELA-${year}-${String(next).padStart(4, '0')}`;
    });

    const now = Date.now();
    const invoiceData = {
      invoiceNumber,
      clientId,
      clientName,
      clientEmail,
      clientAddress: clientAddress || null,
      lineItems: computedItems,
      subtotal,
      taxTotal,
      total,
      amountPaid: 0,
      amountDue: total,
      status: 'draft',
      dueDate,
      issuedDate: now,
      paidDate: null,
      paymentMethod: null,
      stripeInvoiceId: null,
      notes: notes || null,
      terms: terms || null,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('invoices').add(invoiceData);

    return res.json({
      id: docRef.id,
      ...invoiceData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Authorization')) {
      return res.status(401).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
}
