import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors.js';

// Lazy-load each handler to keep the router thin
import calculateTaxReserve from './_handlers/calculateTaxReserve.js';
import getCashFlowForecast from './_handlers/getCashFlowForecast.js';
import getExpenseReport from './_handlers/getExpenseReport.js';
import getProfitLoss from './_handlers/getProfitLoss.js';
import getRevenueReport from './_handlers/getRevenueReport.js';
import recordTransaction from './_handlers/recordTransaction.js';

const routes: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse>> = {
  calculateTaxReserve,
  getCashFlowForecast,
  getExpenseReport,
  getProfitLoss,
  getRevenueReport,
  recordTransaction,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (!process.env.FIREBASE_PROJECT_ID || !(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return res.status(503).json({ error: 'Secure financial and invoice services are not configured.' });
  }

  // Extract action from query string: /api/financial?action=getProfitLoss
  const action = req.query.action as string;

  if (!action || !routes[action]) {
    return res.status(400).json({
      error: `Unknown action: "${action}". Valid actions: ${Object.keys(routes).join(', ')}`,
    });
  }

  return routes[action](req, res);
}
