import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors.js';

import createInvoice from './_handlers/createInvoice.js';
import generateReceipt from './_handlers/generateReceipt.js';
import getClientBalance from './_handlers/getClientBalance.js';
import markInvoicePaid from './_handlers/markInvoicePaid.js';
import sendInvoice from './_handlers/sendInvoice.js';

const routes: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse>> = {
  createInvoice,
  generateReceipt,
  getClientBalance,
  markInvoicePaid,
  sendInvoice,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const action = req.query.action as string;

  if (!action || !routes[action]) {
    return res.status(400).json({
      error: `Unknown action: "${action}". Valid actions: ${Object.keys(routes).join(', ')}`,
    });
  }

  return routes[action](req, res);
}
