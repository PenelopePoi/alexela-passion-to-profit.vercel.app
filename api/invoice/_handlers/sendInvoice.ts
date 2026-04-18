import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, db } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAuth(req.headers.authorization);

    const { invoiceId } = req.body as { invoiceId: string };

    if (!invoiceId) {
      return res.status(400).json({ error: 'Missing required field: invoiceId' });
    }

    const docRef = db.collection('invoices').doc(invoiceId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = snap.data()!;

    // Only draft invoices can be sent
    if (invoice.status !== 'draft') {
      return res.status(400).json({
        error: `Cannot send invoice with status "${invoice.status}". Only draft invoices can be sent.`,
      });
    }

    const now = Date.now();
    await docRef.update({
      status: 'sent',
      issuedDate: now,
      updatedAt: now,
    });

    return res.json({
      id: invoiceId,
      status: 'sent',
      invoiceNumber: invoice.invoiceNumber,
      clientEmail: invoice.clientEmail,
      issuedDate: now,
      updatedAt: now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Authorization')) {
      return res.status(401).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
}
