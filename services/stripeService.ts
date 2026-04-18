/**
 * Stripe Service — XELA Creative Branding Studio
 *
 * Client-side Stripe integration. All sensitive operations are delegated to
 * Vercel Serverless Functions (/api/stripe/*). This module handles:
 * - Stripe.js initialization
 * - Checkout session creation (via /api/stripe/checkout)
 * - Payment plan setup (via /api/stripe/checkout)
 * - Subscription management (via /api/stripe/checkout)
 * - Payment status polling (via /api/stripe/status)
 * - Customer portal redirect (via /api/stripe/portal)
 *
 * Security: Only VITE_STRIPE_PUBLISHABLE_KEY is used client-side.
 * All charge creation, webhook handling, and secret-key operations
 * live in Vercel Serverless Functions.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  PackageTier,
  RetainerTier,
  CheckoutSessionResponse,
  PaymentStatusResponse,
  PACKAGE_PRICES,
  RETAINER_PRICES,
  MAX_INSTALLMENTS,
  MIN_INSTALLMENT_AMOUNT,
} from '../types/financial';

// ─── Stripe.js Singleton ─────────────────────────────────────────────────────

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new StripeServiceError(
        'VITE_STRIPE_PUBLISHABLE_KEY is not configured. Add it to your .env file.',
        'MISSING_CONFIG'
      );
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

// ─── API Helper ─────────────────────────────────────────────────────────────

async function apiCall<T>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(endpoint, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new StripeServiceError(
      data.error || `API call failed: ${res.status}`,
      'API_ERROR',
      { status: res.status, endpoint }
    );
  }

  return data as T;
}

// ─── Error Handling ──────────────────────────────────────────────────────────

export class StripeServiceError extends Error {
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'STRIPE_ERROR',
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'StripeServiceError';
    this.code = code;
    this.details = details;
  }
}

function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new StripeServiceError(
      'Invalid email address provided.',
      'INVALID_EMAIL',
      { email }
    );
  }
}

// ─── Checkout Session ────────────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout session for a one-time package purchase.
 * Redirects the user to Stripe's hosted checkout page.
 */
export async function createCheckoutSession(
  packageTier: PackageTier,
  customerEmail: string
): Promise<CheckoutSessionResponse> {
  validateEmail(customerEmail);

  if (!Object.values(PackageTier).includes(packageTier)) {
    throw new StripeServiceError(
      `Invalid package tier: ${packageTier}`,
      'INVALID_TIER',
      { packageTier }
    );
  }

  const price = PACKAGE_PRICES[packageTier];
  if (!price || price <= 0) {
    throw new StripeServiceError(
      `No price configured for tier: ${packageTier}`,
      'PRICE_NOT_FOUND',
      { packageTier }
    );
  }

  return apiCall<CheckoutSessionResponse>('/api/stripe/checkout', {
    packageTier,
    customerEmail,
    successUrl: `${window.location.origin}/?view=payment-success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/?view=payment-canceled`,
  });
}

/**
 * Redirects the browser to Stripe Checkout for the given session.
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    throw new StripeServiceError('Stripe failed to initialize.', 'STRIPE_INIT_FAILED');
  }

  const { error } = await (stripe as any).redirectToCheckout({ sessionId });
  if (error) {
    throw new StripeServiceError(
      error.message ?? 'Checkout redirect failed.',
      'CHECKOUT_REDIRECT_FAILED',
      { type: error.type }
    );
  }
}

// ─── Payment Plans ───────────────────────────────────────────────────────────

/**
 * Creates a payment plan (installment schedule) for a package.
 */
export async function createPaymentPlan(
  packageTier: PackageTier,
  installments: number,
  customerEmail: string
): Promise<CheckoutSessionResponse> {
  validateEmail(customerEmail);

  if (!Object.values(PackageTier).includes(packageTier)) {
    throw new StripeServiceError(
      `Invalid package tier: ${packageTier}`,
      'INVALID_TIER',
      { packageTier }
    );
  }

  if (!Number.isInteger(installments) || installments < 2 || installments > MAX_INSTALLMENTS) {
    throw new StripeServiceError(
      `Installments must be between 2 and ${MAX_INSTALLMENTS}.`,
      'INVALID_INSTALLMENTS',
      { installments, max: MAX_INSTALLMENTS }
    );
  }

  const totalPrice = PACKAGE_PRICES[packageTier];
  const installmentAmount = Math.ceil(totalPrice / installments);

  if (installmentAmount < MIN_INSTALLMENT_AMOUNT) {
    throw new StripeServiceError(
      `Installment amount ($${(installmentAmount / 100).toFixed(2)}) is below the minimum ($${(MIN_INSTALLMENT_AMOUNT / 100).toFixed(2)}).`,
      'INSTALLMENT_TOO_LOW',
      { installmentAmount, minimum: MIN_INSTALLMENT_AMOUNT }
    );
  }

  return apiCall<CheckoutSessionResponse>('/api/stripe/checkout', {
    mode: 'payment_plan',
    packageTier,
    installments,
    customerEmail,
    successUrl: `${window.location.origin}/?view=payment-success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/?view=payment-canceled`,
  });
}

// ─── Subscriptions (Retainers) ───────────────────────────────────────────────

/**
 * Creates a recurring subscription for a retainer package.
 */
export async function createSubscription(
  retainerTier: RetainerTier,
  customerEmail: string
): Promise<CheckoutSessionResponse> {
  validateEmail(customerEmail);

  if (!Object.values(RetainerTier).includes(retainerTier)) {
    throw new StripeServiceError(
      `Invalid retainer tier: ${retainerTier}`,
      'INVALID_TIER',
      { retainerTier }
    );
  }

  const price = RETAINER_PRICES[retainerTier];
  if (!price || price <= 0) {
    throw new StripeServiceError(
      `No price configured for retainer tier: ${retainerTier}`,
      'PRICE_NOT_FOUND',
      { retainerTier }
    );
  }

  return apiCall<CheckoutSessionResponse>('/api/stripe/checkout', {
    mode: 'subscription',
    retainerTier,
    customerEmail,
    successUrl: `${window.location.origin}/?view=payment-success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/?view=payment-canceled`,
  });
}

// ─── Payment Status ──────────────────────────────────────────────────────────

/**
 * Checks the status of a checkout session / payment.
 */
export async function getPaymentStatus(
  sessionId: string
): Promise<PaymentStatusResponse> {
  if (!sessionId?.startsWith('cs_')) {
    throw new StripeServiceError(
      'Invalid checkout session ID format.',
      'INVALID_SESSION_ID',
      { sessionId }
    );
  }

  return apiCall<PaymentStatusResponse>(`/api/stripe/status?session_id=${encodeURIComponent(sessionId)}`);
}

/**
 * Polls payment status until it resolves or times out.
 */
export async function pollPaymentStatus(
  sessionId: string,
  intervalMs: number = 2000,
  timeoutMs: number = 120000
): Promise<PaymentStatusResponse> {
  const startTime = Date.now();

  const poll = async (): Promise<PaymentStatusResponse> => {
    const status = await getPaymentStatus(sessionId);

    const terminalStatuses = ['succeeded', 'failed', 'canceled', 'refunded'];
    if (terminalStatuses.includes(status.status)) {
      return status;
    }

    if (Date.now() - startTime > timeoutMs) {
      throw new StripeServiceError(
        'Payment status check timed out.',
        'PAYMENT_TIMEOUT',
        { sessionId, elapsed: Date.now() - startTime }
      );
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(poll()), intervalMs);
    });
  };

  return poll();
}

// ─── Customer Portal ─────────────────────────────────────────────────────────

/**
 * Creates a Stripe Customer Portal link for subscription/payment management.
 */
export async function createCustomerPortalLink(
  customerId: string
): Promise<string> {
  if (!customerId?.startsWith('cus_')) {
    throw new StripeServiceError(
      'A valid Stripe customer ID is required.',
      'INVALID_CUSTOMER_ID',
      { customerId }
    );
  }

  const data = await apiCall<{ url: string }>('/api/stripe/portal', {
    customerId,
    returnUrl: `${window.location.origin}/?view=dashboard`,
  });

  return data.url;
}

/**
 * Redirects the user to Stripe Customer Portal.
 */
export async function redirectToCustomerPortal(customerId: string): Promise<void> {
  const url = await createCustomerPortalLink(customerId);
  window.location.href = url;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function formatCurrency(amountCents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export function getPackageTierLabel(tier: PackageTier): string {
  const labels: Record<PackageTier, string> = {
    [PackageTier.BUDGET]: 'Budget Starter',
    [PackageTier.PREMIUM]: 'Premium Brand',
    [PackageTier.ELITE]: 'Elite Identity',
  };
  return labels[tier] ?? tier;
}

export function getRetainerTierLabel(tier: RetainerTier): string {
  const labels: Record<RetainerTier, string> = {
    [RetainerTier.BASIC]: 'Basic Retainer',
    [RetainerTier.STANDARD]: 'Standard Retainer',
    [RetainerTier.PREMIUM]: 'Premium Retainer',
  };
  return labels[tier] ?? tier;
}
