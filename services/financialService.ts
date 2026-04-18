/**
 * Financial Service — XELA Creative Branding Studio
 *
 * Revenue tracking, expense management, profit/loss reporting,
 * tax reserve calculations, and cash flow forecasting.
 *
 * Security: All write operations go through Firebase Functions.
 * Read operations use Firestore with security rules.
 * No sensitive financial data is exposed client-side without auth.
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from '@firebase/firestore';
import { db, auth } from '../firebase';
import {
  Transaction,
  TransactionType,
  ExpenseCategory,
  FinancialReport,
  RevenueBreakdown,
  ExpenseBreakdown,
  CashFlowForecast,
  TaxReserve,
  PaymentMethod,
  PackageTier,
  RetainerTier,
  FINANCIAL_ENDPOINTS,
} from '../types/financial';

// ─── API Helper ─────────────────────────────────────────────────────────────

async function apiCall<T>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api/financial/${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new FinancialServiceError(data.error || `API error: ${res.status}`, 'API_ERROR');
  return data as T;
}

// ─── Error Handling ──────────────────────────────────────────────────────────

export class FinancialServiceError extends Error {
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'FINANCIAL_ERROR',
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'FinancialServiceError';
    this.code = code;
    this.details = details;
  }
}

function requireAuth(): void {
  if (!auth.currentUser) {
    throw new FinancialServiceError(
      'Authentication required for financial operations.',
      'AUTH_REQUIRED'
    );
  }
}

function validateDateRange(startDate: number, endDate: number): void {
  if (!Number.isFinite(startDate) || !Number.isFinite(endDate)) {
    throw new FinancialServiceError(
      'Start and end dates must be valid timestamps.',
      'INVALID_DATE_RANGE',
      { startDate, endDate }
    );
  }
  if (startDate >= endDate) {
    throw new FinancialServiceError(
      'Start date must be before end date.',
      'INVALID_DATE_RANGE',
      { startDate, endDate }
    );
  }
}

// ─── Record Transaction ──────────────────────────────────────────────────────

interface RecordTransactionRequest {
  type: TransactionType;
  amount: number; // cents
  description: string;
  clientId: string | null;
  category?: ExpenseCategory;
  metadata?: Record<string, string>;
}

/**
 * Records a financial transaction via server-side Firebase Function.
 * All transaction writes must go through the server for audit trail.
 *
 * @param type - revenue | expense | refund | tax_payment | transfer | adjustment
 * @param amount - Amount in cents (always positive; type determines direction)
 * @param description - Human-readable description
 * @param clientId - Associated client ID (null for non-client transactions)
 * @param category - Expense category (required for expense transactions)
 * @param metadata - Additional key-value metadata
 * @returns Created transaction
 */
export async function recordTransaction(
  type: TransactionType,
  amount: number,
  description: string,
  clientId: string | null,
  category?: ExpenseCategory,
  metadata?: Record<string, string>
): Promise<Transaction> {
  requireAuth();

  if (!Object.values(TransactionType).includes(type)) {
    throw new FinancialServiceError(
      `Invalid transaction type: ${type}`,
      'INVALID_TYPE',
      { type }
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new FinancialServiceError(
      'Amount must be a positive number in cents.',
      'INVALID_AMOUNT',
      { amount }
    );
  }

  if (!description || description.trim().length === 0) {
    throw new FinancialServiceError(
      'Transaction description is required.',
      'MISSING_DESCRIPTION'
    );
  }

  if (type === TransactionType.EXPENSE && !category) {
    throw new FinancialServiceError(
      'Expense category is required for expense transactions.',
      'MISSING_CATEGORY'
    );
  }

  if (category && !Object.values(ExpenseCategory).includes(category)) {
    throw new FinancialServiceError(
      `Invalid expense category: ${category}`,
      'INVALID_CATEGORY',
      { category }
    );
  }

  try {
    return await apiCall<Transaction>(FINANCIAL_ENDPOINTS.recordTransaction, {
      type,
      amount,
      description: description.trim(),
      clientId,
      category,
      metadata,
    });
  } catch (error) {
    throw wrapError(error, 'Failed to record transaction');
  }
}

// ─── Revenue Report ──────────────────────────────────────────────────────────

/**
 * Gets a revenue report for the specified date range.
 * Aggregates by package tier and retainer tier.
 *
 * @param startDate - Period start (Unix ms)
 * @param endDate - Period end (Unix ms)
 * @returns Revenue breakdown
 */
export async function getRevenueReport(
  startDate: number,
  endDate: number
): Promise<RevenueBreakdown> {
  requireAuth();
  validateDateRange(startDate, endDate);

  try {
    return await apiCall<RevenueBreakdown>(FINANCIAL_ENDPOINTS.getRevenueReport, {
      startDate,
      endDate,
    });
  } catch (error) {
    throw wrapError(error, 'Failed to fetch revenue report');
  }
}

// ─── Expense Report ──────────────────────────────────────────────────────────

/**
 * Gets an expense report for the specified date range.
 * Aggregates by expense category.
 *
 * @param startDate - Period start (Unix ms)
 * @param endDate - Period end (Unix ms)
 * @returns Expense breakdown by category
 */
export async function getExpenseReport(
  startDate: number,
  endDate: number
): Promise<ExpenseBreakdown> {
  requireAuth();
  validateDateRange(startDate, endDate);

  try {
    return await apiCall<ExpenseBreakdown>(FINANCIAL_ENDPOINTS.getExpenseReport, {
      startDate,
      endDate,
    });
  } catch (error) {
    throw wrapError(error, 'Failed to fetch expense report');
  }
}

// ─── Profit & Loss ──────────────────────────────────────────────────────────

type ProfitLossPeriod = 'month' | 'quarter' | 'year' | 'ytd' | 'custom';

interface ProfitLossRequest {
  period: ProfitLossPeriod;
  startDate?: number;
  endDate?: number;
}

/**
 * Gets a profit/loss statement for the given period.
 *
 * @param period - month | quarter | year | ytd | custom
 * @param startDate - Required for 'custom' period (Unix ms)
 * @param endDate - Required for 'custom' period (Unix ms)
 * @returns Full financial report
 */
export async function getProfitLoss(
  period: ProfitLossPeriod,
  startDate?: number,
  endDate?: number
): Promise<FinancialReport> {
  requireAuth();

  const validPeriods: ProfitLossPeriod[] = ['month', 'quarter', 'year', 'ytd', 'custom'];
  if (!validPeriods.includes(period)) {
    throw new FinancialServiceError(
      `Invalid period: ${period}. Use: ${validPeriods.join(', ')}`,
      'INVALID_PERIOD',
      { period }
    );
  }

  if (period === 'custom') {
    if (!startDate || !endDate) {
      throw new FinancialServiceError(
        'Custom period requires startDate and endDate.',
        'MISSING_DATES'
      );
    }
    validateDateRange(startDate, endDate);
  }

  try {
    return await apiCall<FinancialReport>(FINANCIAL_ENDPOINTS.getProfitLoss, {
      period,
      startDate,
      endDate,
    });
  } catch (error) {
    throw wrapError(error, 'Failed to fetch profit/loss report');
  }
}

// ─── Tax Reserve ─────────────────────────────────────────────────────────────

interface TaxReserveRequest {
  revenue: number; // cents
  taxRate: number; // percentage, e.g. 24.5
  startDate?: number;
  endDate?: number;
}

/**
 * Calculates the recommended tax reserve based on revenue and tax rate.
 * Uses Florida's state requirements + federal self-employment estimates.
 *
 * @param revenue - Total revenue for the period (cents)
 * @param taxRate - Combined tax rate as percentage (e.g. 24.5 for 24.5%)
 * @param startDate - Optional period start
 * @param endDate - Optional period end
 * @returns Tax reserve calculation with quarterly estimates
 */
export async function calculateTaxReserve(
  revenue: number,
  taxRate: number,
  startDate?: number,
  endDate?: number
): Promise<TaxReserve> {
  requireAuth();

  if (!Number.isFinite(revenue) || revenue < 0) {
    throw new FinancialServiceError(
      'Revenue must be a non-negative number in cents.',
      'INVALID_REVENUE',
      { revenue }
    );
  }

  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new FinancialServiceError(
      'Tax rate must be between 0 and 100.',
      'INVALID_TAX_RATE',
      { taxRate }
    );
  }

  if (startDate && endDate) {
    validateDateRange(startDate, endDate);
  }

  try {
    return await apiCall<TaxReserve>(FINANCIAL_ENDPOINTS.calculateTaxReserve, {
      revenue,
      taxRate,
      startDate,
      endDate,
    });
  } catch (error) {
    throw wrapError(error, 'Failed to calculate tax reserve');
  }
}

// ─── Cash Flow Forecast ──────────────────────────────────────────────────────

/**
 * Generates a cash flow forecast for the specified number of months.
 * Uses historical data, active subscriptions, and pending invoices.
 *
 * @param months - Number of months to forecast (1-24)
 * @returns Monthly cash flow projections
 */
export async function getCashFlowForecast(
  months: number
): Promise<CashFlowForecast> {
  requireAuth();

  if (!Number.isInteger(months) || months < 1 || months > 24) {
    throw new FinancialServiceError(
      'Forecast months must be between 1 and 24.',
      'INVALID_MONTHS',
      { months }
    );
  }

  try {
    return await apiCall<CashFlowForecast>(FINANCIAL_ENDPOINTS.getCashFlowForecast, {
      months,
    });
  } catch (error) {
    throw wrapError(error, 'Failed to generate cash flow forecast');
  }
}

// ─── Transaction Queries (Firestore Direct Reads) ────────────────────────────

/**
 * Gets transactions for a date range from Firestore.
 * Security rules enforce that only admin/owner can read financial data.
 *
 * @param startDate - Period start (Unix ms)
 * @param endDate - Period end (Unix ms)
 * @param type - Optional filter by transaction type
 * @returns Array of transactions
 */
export async function getTransactions(
  startDate: number,
  endDate: number,
  type?: TransactionType
): Promise<Transaction[]> {
  requireAuth();
  validateDateRange(startDate, endDate);

  try {
    const txRef = collection(db, 'transactions');
    const constraints = [
      where('createdAt', '>=', Timestamp.fromMillis(startDate)),
      where('createdAt', '<=', Timestamp.fromMillis(endDate)),
      orderBy('createdAt', 'desc'),
    ];

    if (type) {
      constraints.unshift(where('type', '==', type));
    }

    const txQuery = query(txRef, ...constraints);
    const snapshot = await getDocs(txQuery);

    return snapshot.docs.map((d) => mapFirestoreTransaction(d.id, d.data()));
  } catch (error) {
    throw wrapError(error, 'Failed to fetch transactions');
  }
}

/**
 * Gets transactions for a specific client.
 *
 * @param clientId - The client ID
 * @returns Array of transactions for the client
 */
export async function getClientTransactions(clientId: string): Promise<Transaction[]> {
  requireAuth();

  if (!clientId) {
    throw new FinancialServiceError('Client ID is required.', 'INVALID_CLIENT_ID');
  }

  try {
    const txRef = collection(db, 'transactions');
    const clientQuery = query(
      txRef,
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(clientQuery);
    return snapshot.docs.map((d) => mapFirestoreTransaction(d.id, d.data()));
  } catch (error) {
    throw wrapError(error, 'Failed to fetch client transactions');
  }
}

// ─── Quick Stats ─────────────────────────────────────────────────────────────

/**
 * Gets quick financial stats for the dashboard.
 * Returns current month revenue, outstanding invoices, and MRR.
 */
export async function getDashboardStats(): Promise<{
  currentMonthRevenue: number;
  outstandingInvoices: number;
  activeSubscriptionCount: number;
  monthlyRecurringRevenue: number;
}> {
  requireAuth();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

  try {
    const [transactions, invoiceSnapshot, subscriptionSnapshot] = await Promise.all([
      getTransactions(monthStart, monthEnd, TransactionType.REVENUE),
      getDocs(
        query(
          collection(db, 'invoices'),
          where('status', 'in', ['sent', 'viewed', 'partially_paid', 'overdue'])
        )
      ),
      getDocs(
        query(
          collection(db, 'subscriptions'),
          where('status', '==', 'active')
        )
      ),
    ]);

    const currentMonthRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    const outstandingInvoices = invoiceSnapshot.docs.reduce((sum, d) => {
      const data = d.data();
      return sum + (Number(data.amountDue) || 0);
    }, 0);

    let monthlyRecurringRevenue = 0;
    subscriptionSnapshot.docs.forEach((d) => {
      const data = d.data();
      const amount = Number(data.amount) || 0;
      if (data.interval === 'year') {
        monthlyRecurringRevenue += Math.round(amount / 12);
      } else {
        monthlyRecurringRevenue += amount;
      }
    });

    return {
      currentMonthRevenue,
      outstandingInvoices,
      activeSubscriptionCount: subscriptionSnapshot.size,
      monthlyRecurringRevenue,
    };
  } catch (error) {
    throw wrapError(error, 'Failed to fetch dashboard stats');
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapFirestoreTransaction(
  id: string,
  data: Record<string, unknown>
): Transaction {
  return {
    id,
    type: (data.type as TransactionType) ?? TransactionType.REVENUE,
    amount: Number(data.amount ?? 0),
    currency: String(data.currency ?? 'usd'),
    description: String(data.description ?? ''),
    clientId: data.clientId ? String(data.clientId) : null,
    invoiceId: data.invoiceId ? String(data.invoiceId) : null,
    stripePaymentIntentId: data.stripePaymentIntentId
      ? String(data.stripePaymentIntentId)
      : null,
    paymentMethod: (data.paymentMethod as Transaction['paymentMethod']) ?? PaymentMethod.STRIPE,
    category: (data.category as ExpenseCategory) ?? null,
    metadata: (data.metadata as Record<string, string>) ?? {},
    createdAt: toUnixMs(data.createdAt),
    updatedAt: toUnixMs(data.updatedAt),
  };
}

function toUnixMs(value: unknown): number {
  if (value && typeof value === 'object' && 'toMillis' in value) {
    return (value as Timestamp).toMillis();
  }
  if (typeof value === 'number') {
    return value;
  }
  return Date.now();
}

function wrapError(error: unknown, context: string): FinancialServiceError {
  if (error instanceof FinancialServiceError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.';

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : 'UNKNOWN_ERROR';

  return new FinancialServiceError(`${context}: ${message}`, code, {
    originalError: String(error),
  });
}
