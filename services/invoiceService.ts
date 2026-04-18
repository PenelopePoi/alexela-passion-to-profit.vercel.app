/**
 * Invoice Service — XELA Creative Branding Studio
 *
 * Client-side invoice management. All write operations are delegated
 * to Firebase Functions (server-side) to enforce security rules.
 * Read operations use Firestore directly with security rules enforcement.
 *
 * Security: No direct Firestore writes for financial data.
 * All mutations go through authenticated Cloud Functions.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from '@firebase/firestore';
import { db, auth } from '../firebase';
import {
  Invoice,
  InvoiceStatus,
  LineItem,
  PaymentMethod,
  CustomerBalance,
  FINANCIAL_ENDPOINTS,
} from '../types/financial';

// ─── API Helper ─────────────────────────────────────────────────────────────

async function apiCall<T>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api/invoice/${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new InvoiceServiceError(data.error || `API error: ${res.status}`, 'API_ERROR');
  return data as T;
}

// ─── Error Handling ──────────────────────────────────────────────────────────

export class InvoiceServiceError extends Error {
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'INVOICE_ERROR',
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'InvoiceServiceError';
    this.code = code;
    this.details = details;
  }
}

function requireAuth(): void {
  if (!auth.currentUser) {
    throw new InvoiceServiceError(
      'Authentication required for invoice operations.',
      'AUTH_REQUIRED'
    );
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateInvoiceRequest {
  clientData: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientAddress?: string;
  };
  lineItems: LineItem[];
  dueDate: number; // Unix ms
  notes?: string;
  terms?: string;
}

interface SendInvoiceRequest {
  invoiceId: string;
  message?: string;
}

interface MarkPaidRequest {
  invoiceId: string;
  paymentMethod: PaymentMethod;
  amount?: number; // cents — for partial payments
  notes?: string;
}

interface ReceiptData {
  receiptNumber: string;
  invoiceId: string;
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paidDate: number;
  receiptUrl: string;
}

// ─── Create Invoice ──────────────────────────────────────────────────────────

/**
 * Creates a new invoice via server-side Firebase Function.
 *
 * @param clientData - Client information
 * @param lineItems - Itemized charges
 * @param dueDate - Payment due date (Unix ms)
 * @param notes - Optional notes
 * @param terms - Optional payment terms
 * @returns Created invoice
 */
export async function createInvoice(
  clientData: CreateInvoiceRequest['clientData'],
  lineItems: LineItem[],
  dueDate?: number,
  notes?: string,
  terms?: string
): Promise<Invoice> {
  requireAuth();

  if (!clientData.clientId || !clientData.clientName || !clientData.clientEmail) {
    throw new InvoiceServiceError(
      'Client ID, name, and email are required.',
      'INVALID_CLIENT_DATA',
      { clientData }
    );
  }

  if (!lineItems.length) {
    throw new InvoiceServiceError(
      'At least one line item is required.',
      'EMPTY_LINE_ITEMS'
    );
  }

  for (const item of lineItems) {
    if (!item.description || item.quantity <= 0 || item.unitPrice < 0) {
      throw new InvoiceServiceError(
        `Invalid line item: ${item.description || '(no description)'}`,
        'INVALID_LINE_ITEM',
        { item }
      );
    }
  }

  const defaultDueDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // Net 30

  try {
    return await apiCall<Invoice>(FINANCIAL_ENDPOINTS.createInvoice, {
      clientData,
      lineItems: lineItems.map((item) => ({
        ...item,
        total: Math.round(item.quantity * item.unitPrice * (1 + item.taxRate / 100)),
      })),
      dueDate: dueDate ?? defaultDueDate,
      notes,
      terms,
    });
  } catch (error) {
    throw wrapError(error, 'Failed to create invoice');
  }
}

// ─── Send Invoice ────────────────────────────────────────────────────────────

/**
 * Sends an invoice to the client via email (server-side).
 * Updates status from DRAFT to SENT.
 *
 * @param invoiceId - The invoice to send
 * @param message - Optional custom message in the email
 */
export async function sendInvoice(
  invoiceId: string,
  message?: string
): Promise<Invoice> {
  requireAuth();
  validateInvoiceId(invoiceId);

  try {
    return await apiCall<Invoice>(FINANCIAL_ENDPOINTS.sendInvoice, { invoiceId, message });
  } catch (error) {
    throw wrapError(error, 'Failed to send invoice');
  }
}

// ─── Invoice Status ──────────────────────────────────────────────────────────

/**
 * Gets the current status and details of an invoice.
 * Reads directly from Firestore (security rules enforce access).
 *
 * @param invoiceId - The invoice to check
 * @returns Invoice data
 */
export async function getInvoiceStatus(invoiceId: string): Promise<Invoice> {
  requireAuth();
  validateInvoiceId(invoiceId);

  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const snapshot = await getDoc(invoiceRef);

    if (!snapshot.exists()) {
      throw new InvoiceServiceError(
        `Invoice ${invoiceId} not found.`,
        'INVOICE_NOT_FOUND',
        { invoiceId }
      );
    }

    return mapFirestoreInvoice(snapshot.id, snapshot.data());
  } catch (error) {
    if (error instanceof InvoiceServiceError) throw error;
    throw wrapError(error, 'Failed to fetch invoice status');
  }
}

/**
 * Subscribes to real-time invoice status updates.
 *
 * @param invoiceId - The invoice to watch
 * @param callback - Called with updated invoice data
 * @returns Unsubscribe function
 */
export function onInvoiceStatusChange(
  invoiceId: string,
  callback: (invoice: Invoice) => void,
  onError?: (error: InvoiceServiceError) => void
): Unsubscribe {
  const invoiceRef = doc(db, 'invoices', invoiceId);

  return onSnapshot(
    invoiceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(mapFirestoreInvoice(snapshot.id, snapshot.data()));
      }
    },
    (error) => {
      onError?.(wrapError(error, 'Invoice listener error'));
    }
  );
}

// ─── Mark as Paid ────────────────────────────────────────────────────────────

/**
 * Marks an invoice as paid (full or partial) via server-side function.
 *
 * @param invoiceId - The invoice to mark
 * @param paymentMethod - How the payment was received
 * @param amount - Optional partial payment amount in cents
 * @param notes - Optional payment notes
 */
export async function markAsPaid(
  invoiceId: string,
  paymentMethod: PaymentMethod,
  amount?: number,
  notes?: string
): Promise<Invoice> {
  requireAuth();
  validateInvoiceId(invoiceId);

  if (!Object.values(PaymentMethod).includes(paymentMethod)) {
    throw new InvoiceServiceError(
      `Invalid payment method: ${paymentMethod}`,
      'INVALID_PAYMENT_METHOD',
      { paymentMethod }
    );
  }

  if (amount !== undefined && (amount <= 0 || !Number.isFinite(amount))) {
    throw new InvoiceServiceError(
      'Payment amount must be a positive number.',
      'INVALID_AMOUNT',
      { amount }
    );
  }

  try {
    return await apiCall<Invoice>(FINANCIAL_ENDPOINTS.markInvoicePaid, { invoiceId, paymentMethod, amount, notes });
  } catch (error) {
    throw wrapError(error, 'Failed to mark invoice as paid');
  }
}

// ─── Receipt Generation ─────────────────────────────────────────────────────

/**
 * Generates a downloadable receipt for a completed transaction.
 *
 * @param transactionId - The transaction/payment ID
 * @returns Receipt data including a download URL
 */
export async function generateReceipt(transactionId: string): Promise<ReceiptData> {
  requireAuth();

  if (!transactionId) {
    throw new InvoiceServiceError(
      'Transaction ID is required.',
      'INVALID_TRANSACTION_ID'
    );
  }

  try {
    return await apiCall<ReceiptData>(FINANCIAL_ENDPOINTS.generateReceipt, { transactionId });
  } catch (error) {
    throw wrapError(error, 'Failed to generate receipt');
  }
}

// ─── Client Balance ──────────────────────────────────────────────────────────

/**
 * Gets the outstanding balance for a client.
 *
 * @param clientId - The client to check
 * @returns Balance details
 */
export async function getClientBalance(clientId: string): Promise<CustomerBalance> {
  requireAuth();

  if (!clientId) {
    throw new InvoiceServiceError(
      'Client ID is required.',
      'INVALID_CLIENT_ID'
    );
  }

  try {
    return await apiCall<CustomerBalance>(FINANCIAL_ENDPOINTS.getClientBalance, { clientId });
  } catch (error) {
    throw wrapError(error, 'Failed to fetch client balance');
  }
}

// ─── Overdue Invoices ────────────────────────────────────────────────────────

/**
 * Gets all overdue invoices. Reads from Firestore with security rules.
 *
 * @returns Array of overdue invoices sorted by due date (oldest first)
 */
export async function getOverdueInvoices(): Promise<Invoice[]> {
  requireAuth();

  try {
    const invoicesRef = collection(db, 'invoices');
    const overdueQuery = query(
      invoicesRef,
      where('status', 'in', [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIALLY_PAID]),
      where('dueDate', '<', Timestamp.fromMillis(Date.now())),
      orderBy('dueDate', 'asc')
    );

    const snapshot = await getDocs(overdueQuery);
    return snapshot.docs.map((d) => mapFirestoreInvoice(d.id, d.data()));
  } catch (error) {
    throw wrapError(error, 'Failed to fetch overdue invoices');
  }
}

/**
 * Gets all invoices for a specific client.
 *
 * @param clientId - The client ID
 * @returns Array of invoices sorted by issue date (newest first)
 */
export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  requireAuth();

  if (!clientId) {
    throw new InvoiceServiceError('Client ID is required.', 'INVALID_CLIENT_ID');
  }

  try {
    const invoicesRef = collection(db, 'invoices');
    const clientQuery = query(
      invoicesRef,
      where('clientId', '==', clientId),
      orderBy('issuedDate', 'desc')
    );

    const snapshot = await getDocs(clientQuery);
    return snapshot.docs.map((d) => mapFirestoreInvoice(d.id, d.data()));
  } catch (error) {
    throw wrapError(error, 'Failed to fetch client invoices');
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateInvoiceId(invoiceId: string): void {
  if (!invoiceId || typeof invoiceId !== 'string' || invoiceId.trim().length === 0) {
    throw new InvoiceServiceError(
      'A valid invoice ID is required.',
      'INVALID_INVOICE_ID'
    );
  }
}

function mapFirestoreInvoice(id: string, data: Record<string, unknown>): Invoice {
  return {
    id,
    invoiceNumber: String(data.invoiceNumber ?? ''),
    clientId: String(data.clientId ?? ''),
    clientName: String(data.clientName ?? ''),
    clientEmail: String(data.clientEmail ?? ''),
    clientAddress: data.clientAddress ? String(data.clientAddress) : null,
    lineItems: (data.lineItems as LineItem[]) ?? [],
    subtotal: Number(data.subtotal ?? 0),
    taxTotal: Number(data.taxTotal ?? 0),
    total: Number(data.total ?? 0),
    amountPaid: Number(data.amountPaid ?? 0),
    amountDue: Number(data.amountDue ?? 0),
    status: (data.status as InvoiceStatus) ?? InvoiceStatus.DRAFT,
    dueDate: toUnixMs(data.dueDate),
    issuedDate: toUnixMs(data.issuedDate),
    paidDate: data.paidDate ? toUnixMs(data.paidDate) : null,
    paymentMethod: (data.paymentMethod as PaymentMethod) ?? null,
    stripeInvoiceId: data.stripeInvoiceId ? String(data.stripeInvoiceId) : null,
    notes: data.notes ? String(data.notes) : null,
    terms: data.terms ? String(data.terms) : null,
    createdAt: toUnixMs(data.createdAt),
    updatedAt: toUnixMs(data.updatedAt),
  };
}

function toUnixMs(value: unknown): number {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (typeof value === 'number') {
    return value;
  }
  return Date.now();
}

function wrapError(error: unknown, context: string): InvoiceServiceError {
  if (error instanceof InvoiceServiceError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.';

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : 'UNKNOWN_ERROR';

  return new InvoiceServiceError(`${context}: ${message}`, code, {
    originalError: String(error),
  });
}
