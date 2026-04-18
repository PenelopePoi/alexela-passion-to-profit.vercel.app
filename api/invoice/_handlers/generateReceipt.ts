import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAuth(req.headers.authorization);

    const { invoiceId, transactionId } = req.body as {
      invoiceId?: string;
      transactionId?: string;
    };

    if (!invoiceId && !transactionId) {
      return res.status(400).json({
        error: 'Provide either invoiceId or transactionId',
      });
    }

    let invoice: FirebaseFirestore.DocumentData | undefined;
    let transaction: FirebaseFirestore.DocumentData | undefined;

    // Load invoice if provided
    if (invoiceId) {
      const invSnap = await db.collection('invoices').doc(invoiceId).get();
      if (!invSnap.exists) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      invoice = { id: invSnap.id, ...invSnap.data()! };

      // Invoice must be paid or partially paid to generate a receipt
      if (!['paid', 'partially_paid'].includes(invoice.status)) {
        return res.status(400).json({
          error: `Cannot generate receipt for invoice with status "${invoice.status}".`,
        });
      }
    }

    // Load transaction if provided
    if (transactionId) {
      const txSnap = await db.collection('transactions').doc(transactionId).get();
      if (!txSnap.exists) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      transaction = { id: txSnap.id, ...txSnap.data()! };
    }

    // If only invoiceId, find the most recent matching transaction
    if (invoiceId && !transactionId) {
      const txQuery = await db
        .collection('transactions')
        .where('invoiceId', '==', invoiceId)
        .where('type', '==', 'revenue')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!txQuery.empty) {
        const txDoc = txQuery.docs[0];
        transaction = { id: txDoc.id, ...txDoc.data() };
      }
    }

    // If only transactionId, load its linked invoice
    if (transactionId && !invoiceId && transaction?.invoiceId) {
      const invSnap = await db.collection('invoices').doc(transaction.invoiceId).get();
      if (invSnap.exists) {
        invoice = { id: invSnap.id, ...invSnap.data()! };
      }
    }

    const now = Date.now();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(now).slice(-6)}`;

    const receipt = {
      receiptNumber,
      generatedAt: now,
      business: {
        name: 'XELA Creative Branding Studio',
        phone: '(321) 375-9685',
        location: 'Brevard County, FL',
      },
      client: invoice
        ? {
            id: invoice.clientId,
            name: invoice.clientName,
            email: invoice.clientEmail,
            address: invoice.clientAddress,
          }
        : transaction
          ? { id: transaction.clientId }
          : null,
      invoice: invoice
        ? {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            lineItems: invoice.lineItems,
            subtotal: invoice.subtotal,
            taxTotal: invoice.taxTotal,
            total: invoice.total,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue,
            issuedDate: invoice.issuedDate,
            paidDate: invoice.paidDate,
          }
        : null,
      payment: transaction
        ? {
            id: transaction.id,
            amount: transaction.amount,
            method: transaction.paymentMethod,
            date: transaction.createdAt,
            description: transaction.description,
            stripePaymentIntentId: transaction.stripePaymentIntentId,
          }
        : {
            amount: invoice?.amountPaid ?? 0,
            method: invoice?.paymentMethod ?? 'unknown',
            date: invoice?.paidDate ?? now,
          },
    };

    // Store the receipt in Firestore for future reference
    const receiptRef = await db.collection('receipts').add(receipt);

    return res.json({
      id: receiptRef.id,
      ...receipt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Authorization')) {
      return res.status(401).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
}
