import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors';

// Lazy-load each handler to keep the router thin
import calculateTaxReserve from './_handlers/calculateTaxReserve';
import getCashFlowForecast from './_handlers/getCashFlowForecast';
import getExpenseReport from './_handlers/getExpenseReport';
import getProfitLoss from './_handlers/getProfitLoss';
import getRevenueReport from './_handlers/getRevenueReport';
import recordTransaction from './_handlers/recordTransaction';

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

  // Extract action from query string: /api/financial?action=getProfitLoss
  const action = req.query.action as string;

  if (!action || !routes[action]) {
    return res.status(400).json({
      error: `Unknown action: "${action}". Valid actions: ${Object.keys(routes).join(', ')}`,
    });
  }

  return routes[action](req, res);
}
