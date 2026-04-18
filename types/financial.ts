/**
 * Financial Types — XELA Creative Branding Studio
 * Strict TypeScript definitions for all payment, invoice, and financial operations.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELED = 'canceled',
  DISPUTED = 'disputed',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  VOID = 'void',
  WRITTEN_OFF = 'written_off',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  PAUSED = 'paused',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  UNPAID = 'unpaid',
}

export enum TransactionType {
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  REFUND = 'refund',
  TAX_PAYMENT = 'tax_payment',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash',
  ZELLE = 'zelle',
  VENMO = 'venmo',
  PAYPAL = 'paypal',
  OTHER = 'other',
}

export enum PackageTier {
  BUDGET = 'budget',
  PREMIUM = 'premium',
  ELITE = 'elite',
}

export enum RetainerTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export enum ExpenseCategory {
  SOFTWARE = 'software',
  HOSTING = 'hosting',
  AI_COMPUTE = 'ai_compute',
  MARKETING = 'marketing',
  CONTRACTOR = 'contractor',
  OFFICE = 'office',
  TAXES = 'taxes',
  INSURANCE = 'insurance',
  PROFESSIONAL_SERVICES = 'professional_services',
  SUPPLIES = 'supplies',
  OTHER = 'other',
}

// ─── Core Types ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // cents
  currency: string;
  description: string;
  clientId: string | null;
  invoiceId: string | null;
  stripePaymentIntentId: string | null;
  paymentMethod: PaymentMethod;
  category: ExpenseCategory | null;
  metadata: Record<string, string>;
  createdAt: number; // Unix ms
  updatedAt: number;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number; // cents
  taxRate: number; // percentage, e.g. 7.5
  total: number; // cents, calculated
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string | null;
  lineItems: LineItem[];
  subtotal: number; // cents
  taxTotal: number; // cents
  total: number; // cents
  amountPaid: number; // cents
  amountDue: number; // cents
  status: InvoiceStatus;
  dueDate: number; // Unix ms
  issuedDate: number;
  paidDate: number | null;
  paymentMethod: PaymentMethod | null;
  stripeInvoiceId: string | null;
  notes: string | null;
  terms: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number; // cents
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  receiptUrl: string | null;
  failureReason: string | null;
  metadata: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentPlan {
  id: string;
  clientId: string;
  clientEmail: string;
  packageTier: PackageTier;
  totalAmount: number; // cents
  installmentCount: number;
  installmentAmount: number; // cents
  paidInstallments: number;
  nextPaymentDate: number; // Unix ms
  status: 'active' | 'completed' | 'defaulted' | 'canceled';
  stripeSubscriptionId: string | null;
  payments: string[]; // Payment IDs
  createdAt: number;
  updatedAt: number;
}

export interface Subscription {
  id: string;
  clientId: string;
  clientEmail: string;
  retainerTier: RetainerTier;
  amount: number; // cents per period
  currency: string;
  interval: 'month' | 'year';
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
  trialEnd: number | null;
  metadata: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

// ─── Reporting Types ─────────────────────────────────────────────────────────

export interface RevenueBreakdown {
  packageRevenue: Record<PackageTier, number>;
  retainerRevenue: Record<RetainerTier, number>;
  otherRevenue: number;
  totalRevenue: number;
}

export interface ExpenseBreakdown {
  byCategory: Record<ExpenseCategory, number>;
  totalExpenses: number;
}

export interface FinancialReport {
  period: {
    startDate: number;
    endDate: number;
    label: string;
  };
  revenue: RevenueBreakdown;
  expenses: ExpenseBreakdown;
  grossProfit: number;
  netProfit: number;
  profitMargin: number; // percentage
  transactionCount: number;
  invoiceCount: number;
  outstandingReceivables: number;
  generatedAt: number;
}

export interface CashFlowForecast {
  months: CashFlowMonth[];
  totalProjectedRevenue: number;
  totalProjectedExpenses: number;
  projectedNetCashFlow: number;
  assumptions: string[];
  generatedAt: number;
}

export interface CashFlowMonth {
  month: string; // "2026-04"
  projectedRevenue: number;
  projectedExpenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  activeSubscriptions: number;
  expectedPayments: number;
}

export interface CustomerBalance {
  clientId: string;
  clientName: string;
  clientEmail: string;
  totalBilled: number;
  totalPaid: number;
  balance: number; // positive = client owes, negative = overpaid
  overdueAmount: number;
  lastPaymentDate: number | null;
  activeSubscriptions: number;
  activePaymentPlans: number;
}

export interface TaxReserve {
  period: {
    startDate: number;
    endDate: number;
  };
  totalRevenue: number;
  taxRate: number; // percentage
  reserveAmount: number;
  paidToDate: number;
  remainingReserve: number;
  quarterlyEstimates: QuarterlyEstimate[];
}

export interface QuarterlyEstimate {
  quarter: string; // "Q1 2026"
  estimatedTax: number;
  dueDate: number;
  paid: boolean;
  paidAmount: number;
  paidDate: number | null;
}

// ─── Stripe-Specific Types ──────────────────────────────────────────────────

export interface CheckoutSessionRequest {
  packageTier: PackageTier;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PaymentPlanRequest {
  packageTier: PackageTier;
  installments: number;
  customerEmail: string;
}

export interface SubscriptionRequest {
  retainerTier: RetainerTier;
  customerEmail: string;
}

export interface CustomerPortalRequest {
  customerId: string;
  returnUrl: string;
}

export interface PaymentStatusResponse {
  sessionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  customerEmail: string | null;
  paymentIntentId: string | null;
}

// ─── Package Pricing (cents) ─────────────────────────────────────────────────

/**
 * Package prices in cents. Each tier maps to its starting price.
 * Budget: $75-175, Premium: $350-650, Elite: $850-2000
 * The tier price is the lowest package in that tier (used for payment plans).
 */
export const PACKAGE_PRICES: Record<PackageTier, number> = {
  [PackageTier.BUDGET]: 7500, // $75 (CardCut Calibrated — tier starting price)
  [PackageTier.PREMIUM]: 35000, // $350 (Selling Sales Set — tier starting price)
  [PackageTier.ELITE]: 85000, // $850 (The Sovereignty Set — tier starting price)
} as const;

/** Individual package prices in cents, keyed by package ID */
export const INDIVIDUAL_PACKAGE_PRICES: Record<string, { amount: number; name: string; tier: PackageTier }> = {
  // Budget tier: $75-175
  cardcut:    { amount: 7500,   name: 'CardCut Calibrated',       tier: PackageTier.BUDGET },
  promo:      { amount: 12500,  name: 'Promotion Pal',            tier: PackageTier.BUDGET },
  sticker:    { amount: 17500,  name: 'Sticker System',           tier: PackageTier.BUDGET },
  // Premium tier: $350-650
  sales:      { amount: 35000,  name: 'Selling Sales Set',        tier: PackageTier.PREMIUM },
  rebellion:  { amount: 50000,  name: 'Registered Rebellion',     tier: PackageTier.PREMIUM },
  passion:    { amount: 65000,  name: 'Premiere Passion Pal',     tier: PackageTier.PREMIUM },
  // Elite tier: $850-2000
  sovereign:  { amount: 85000,  name: 'The Sovereignty Set',      tier: PackageTier.ELITE },
  site:       { amount: 120000, name: 'Site Sales Solution',      tier: PackageTier.ELITE },
  enterprise: { amount: 150000, name: 'Entrepreneurship Enterprise', tier: PackageTier.ELITE },
  ultimate:   { amount: 200000, name: 'Ultimate Premium Suite',   tier: PackageTier.ELITE },
} as const;

export const RETAINER_PRICES: Record<RetainerTier, number> = {
  [RetainerTier.BASIC]: 9900, // $99/mo (Google Business)
  [RetainerTier.STANDARD]: 15000, // $150/mo (Social Media)
  [RetainerTier.PREMIUM]: 19900, // $199/mo (FB + Nextdoor Ads)
} as const;

export const MAX_INSTALLMENTS = 4;
export const MIN_INSTALLMENT_AMOUNT = 5000; // $50 minimum per installment

// ─── Firebase Function Endpoints ─────────────────────────────────────────────

export const FINANCIAL_ENDPOINTS = {
  createCheckoutSession: 'createCheckoutSession',
  createPaymentPlan: 'createPaymentPlan',
  createSubscription: 'createSubscription',
  getPaymentStatus: 'getPaymentStatus',
  createCustomerPortal: 'createCustomerPortal',
  createInvoice: 'createInvoice',
  sendInvoice: 'sendInvoice',
  getInvoiceStatus: 'getInvoiceStatus',
  markInvoicePaid: 'markInvoicePaid',
  generateReceipt: 'generateReceipt',
  getClientBalance: 'getClientBalance',
  getOverdueInvoices: 'getOverdueInvoices',
  recordTransaction: 'recordTransaction',
  getRevenueReport: 'getRevenueReport',
  getExpenseReport: 'getExpenseReport',
  getProfitLoss: 'getProfitLoss',
  calculateTaxReserve: 'calculateTaxReserve',
  getCashFlowForecast: 'getCashFlowForecast',
  stripeWebhook: 'stripeWebhook',
} as const;
