# Stripe Setup — XELA Creative Branding Studio

## Current State

### What code exists

| File | Purpose | Status |
|------|---------|--------|
| `services/stripeService.ts` | Client-side Stripe.js integration — checkout sessions, payment plans, subscriptions, customer portal, payment status polling | Complete, well-architected |
| `services/financialService.ts` | Revenue tracking, expense management, P&L, tax reserves, cash flow forecasting — all via Firebase Functions | Complete |
| `services/invoiceService.ts` | Invoice CRUD, send, mark paid, receipts, overdue tracking — all via Firebase Functions | Complete |
| `types/financial.ts` | All TypeScript types, enums, Stripe request/response interfaces, pricing constants, endpoint names | Complete |
| `components/Pricing.tsx` | 10 packages + 3 add-ons + 3 monthly retainers displayed to customers | Complete |
| `components/services/PricingTable.tsx` | Feature comparison table across tiers | Complete |

### What's connected

- `@stripe/stripe-js` v9.0.1 is installed in `package.json`
- `@firebase/functions` v0.13.3 is installed for calling Cloud Functions
- `.env.local` has the `VITE_STRIPE_PUBLISHABLE_KEY=` slot (currently empty)
- `stripeService.ts` correctly uses `loadStripe()` with the publishable key only (no secret key in frontend)
- All payment mutations route through `httpsCallable()` to Firebase Functions (correct security model)
- Firebase app is initialized (`firebase.ts`) with project `inner-lightning-484702-r4`

### What's MISSING (the blocker)

1. **No Stripe account** — no keys exist yet
2. **No Firebase Functions directory** — there is no `functions/` folder, no `firebase.json`, no server-side code at all
3. **No Cloud Functions deployed** — the client code calls 17 Firebase Functions that don't exist yet:
   - `createCheckoutSession`
   - `createPaymentPlan`
   - `createSubscription`
   - `getPaymentStatus`
   - `createCustomerPortal`
   - `createInvoice`
   - `sendInvoice`
   - `getInvoiceStatus`
   - `markInvoicePaid`
   - `generateReceipt`
   - `getClientBalance`
   - `getOverdueInvoices`
   - `recordTransaction`
   - `getRevenueReport`
   - `getExpenseReport`
   - `getProfitLoss`
   - `calculateTaxReserve`
   - `getCashFlowForecast`
   - `stripeWebhook`
4. **No Stripe webhook handler** — no endpoint to receive payment confirmations from Stripe
5. **No Stripe Price IDs** — the code uses tier enums (`budget`, `premium`, `elite`) but Stripe needs actual Price IDs (`price_xxx`) created in the dashboard
6. **Pricing mismatch** — `types/financial.ts` says Budget=$299, Premium=$799, Elite=$1,999 but `Pricing.tsx` shows 10 individual packages from $75-$2,000. These need to be reconciled.
7. **No `/payment/success` or `/payment/canceled` routes** — `stripeService.ts` redirects to these after checkout but no components exist for them

---

## To Go Live (step by step)

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Business type: Sole Proprietor (or LLC once registered)
3. Business name: XELA Creative Branding Studio
4. Business address: Brevard County, FL
5. Payout bank account: connect your business bank
6. Complete identity verification

### Step 2: Get Your API Keys

From [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys):

| Key | Where It Goes | Example |
|-----|--------------|---------|
| Publishable key (test) | `.env.local` + Vercel env vars | `pk_test_51Xxx...` |
| Secret key (test) | Firebase Functions `.env` only | `sk_test_51Xxx...` |
| Publishable key (live) | Vercel env vars (production) | `pk_live_51Xxx...` |
| Secret key (live) | Firebase Functions `.env` (production) | `sk_live_51Xxx...` |
| Webhook signing secret | Firebase Functions `.env` | `whsec_xxx...` |

**NEVER put `sk_test_*` or `sk_live_*` in frontend code or `.env.local`.**

### Step 3: Add Publishable Key to Frontend

In `.env.local`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

In Vercel (Settings > Environment Variables):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE   (Preview)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE   (Production)
```

### Step 4: Create Stripe Products & Prices

In [dashboard.stripe.com/products](https://dashboard.stripe.com/products), create each package:

| # | Package | Price | Type | Stripe Product Needed |
|---|---------|-------|------|----------------------|
| 1 | CardCut Calibrated | $75 | One-time | Yes |
| 2 | Promotion Pal | $125 | One-time | Yes |
| 3 | Sticker System | $175 | One-time | Yes |
| 4 | Selling Sales Set | $350 | One-time | Yes |
| 5 | Registered Rebellion | $500 | One-time | Yes |
| 6 | Premiere Passion Pal | $650 | One-time | Yes |
| 7 | The Sovereignty Set | $850 | One-time | Yes |
| 8 | Site Sales Solution | $1,200 | One-time | Yes |
| 9 | Entrepreneurship Enterprise | $1,500 | One-time | Yes |
| 10 | Ultimate Premium Suite | $2,000 | One-time | Yes |

**Add-ons:**

| Add-on | Price | Type |
|--------|-------|------|
| Rush Delivery | $49 | One-time |
| Call Script + Voicemail | $35 | One-time |
| 5-Star Reviews Automated | $45 | One-time |

**Monthly retainers (subscriptions):**

| Retainer | Price | Type |
|----------|-------|------|
| Social Media Management | $150/mo | Recurring monthly |
| Google Business Management | $99/mo | Recurring monthly |
| FB + Nextdoor Ads | $199/mo | Recurring monthly |

After creating each, copy the Price ID (`price_xxx`) — you'll need these in the Firebase Functions.

### Step 5: Initialize Firebase Functions

```bash
# From project root
cd ~/xela-elite-ai-creative-studio

# Install Firebase CLI if not already
npm install -g firebase-tools

# Login
firebase login

# Initialize Functions (select your project: inner-lightning-484702-r4)
firebase init functions

# Choose: TypeScript, ESLint yes, install dependencies yes
```

This creates the `functions/` directory with `src/index.ts`.

### Step 6: Install Stripe in Functions

```bash
cd ~/xela-elite-ai-creative-studio/functions
npm install stripe
```

### Step 7: Set Stripe Secrets in Firebase

```bash
# Set secrets (these are encrypted, never in source code)
firebase functions:secrets:set STRIPE_SECRET_KEY
# Paste: sk_test_YOUR_KEY_HERE

firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Paste: whsec_YOUR_SECRET_HERE
```

### Step 8: Write the Firebase Functions

Create `functions/src/index.ts` with these minimum functions to accept payments:

**Priority 1 — Accept money (MVP):**
- `createCheckoutSession` — creates a Stripe Checkout Session with the correct Price ID, returns the URL
- `stripeWebhook` — receives Stripe events (checkout.session.completed), updates Firestore
- `getPaymentStatus` — looks up a checkout session and returns its status

**Priority 2 — Subscriptions:**
- `createSubscription` — creates a Checkout Session in subscription mode for monthly retainers
- `createCustomerPortal` — creates a Stripe Customer Portal session for managing subscriptions

**Priority 3 — Payment plans:**
- `createPaymentPlan` — creates a subscription with a fixed number of payments (installment plan)

**Priority 4 — Full financial suite (can wait):**
- `createInvoice`, `sendInvoice`, `markInvoicePaid`, `generateReceipt`
- `getClientBalance`, `getOverdueInvoices`, `recordTransaction`
- `getRevenueReport`, `getExpenseReport`, `getProfitLoss`
- `calculateTaxReserve`, `getCashFlowForecast`

### Step 9: Create firebase.json

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

### Step 10: Deploy Firebase Functions

```bash
cd ~/xela-elite-ai-creative-studio
firebase deploy --only functions
```

### Step 11: Configure Stripe Webhook

1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://us-central1-inner-lightning-484702-r4.cloudfunctions.net/stripeWebhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (`whsec_xxx`) and set it in Firebase secrets

### Step 12: Add Success/Cancel Routes

Create components for `/payment/success` and `/payment/canceled` in your React router. The success page should call `getPaymentStatus()` with the `session_id` query param to confirm payment.

---

## Payment Flow Architecture

```
Customer clicks "Get Started" on a package
        │
        ▼
    Pricing.tsx calls onSelectPackage('premium')
        │
        ▼
    App calls stripeService.createCheckoutSession('premium', user.email)
        │
        ▼
    Client calls Firebase Function: createCheckoutSession
        │  (httpsCallable — authenticated, includes user token)
        ▼
    Firebase Function (server-side):
        1. Validates the request
        2. Looks up the Stripe Price ID for the package
        3. Creates a Stripe Checkout Session using sk_test_xxx
        4. Returns { sessionId, url }
        │
        ▼
    Client calls stripeService.redirectToCheckout(sessionId)
        │
        ▼
    Browser redirects to Stripe's hosted checkout page
    Customer enters card info on Stripe's servers
        │
        ├── Success → Stripe redirects to /payment/success?session_id=cs_xxx
        │                  App calls getPaymentStatus(cs_xxx) to confirm
        │
        └── Cancel  → Stripe redirects to /payment/canceled

    Meanwhile (async):
        Stripe fires webhook → stripeWebhook Firebase Function
            1. Verifies webhook signature (whsec_xxx)
            2. Parses the event
            3. On checkout.session.completed:
               - Records transaction in Firestore
               - Updates order status
               - Sends confirmation email (optional)
            4. Returns 200 OK to Stripe
```

**Money path:** Stripe collects payment → holds for 2 business days → deposits to your connected bank account (minus Stripe's 2.9% + $0.30 per transaction).

---

## Pricing Configuration

### One-Time Packages (from Pricing.tsx)

| ID | Package | Price | Tier | Stripe Price ID |
|----|---------|-------|------|-----------------|
| `cardcut` | CardCut Calibrated | $75 | budget | `price_` ← create in dashboard |
| `promo` | Promotion Pal | $125 | budget | `price_` ← create in dashboard |
| `sticker` | Sticker System | $175 | budget | `price_` ← create in dashboard |
| `sales` | Selling Sales Set | $350 | premium | `price_` ← create in dashboard |
| `rebellion` | Registered Rebellion | $500 | premium | `price_` ← create in dashboard |
| `passion` | Premiere Passion Pal | $650 | premium | `price_` ← create in dashboard |
| `sovereign` | The Sovereignty Set | $850 | elite | `price_` ← create in dashboard |
| `site` | Site Sales Solution | $1,200 | elite | `price_` ← create in dashboard |
| `enterprise` | Entrepreneurship Enterprise | $1,500 | elite | `price_` ← create in dashboard |
| `ultimate` | Ultimate Premium Suite | $2,000 | elite | `price_` ← create in dashboard |

### Add-Ons

| Add-on | Price | Stripe Price ID |
|--------|-------|-----------------|
| Rush Delivery (2hr) | $49 | `price_` ← create in dashboard |
| Call Script + Voicemail | $35 | `price_` ← create in dashboard |
| 5-Star Reviews Automated | $45 | `price_` ← create in dashboard |

### Monthly Retainers (Subscriptions)

| Retainer | Price | Stripe Price ID |
|----------|-------|-----------------|
| Social Media (3 posts/wk, 2 platforms) | $150/mo | `price_` ← create in dashboard |
| Google Business (weekly posts, reviews) | $99/mo | `price_` ← create in dashboard |
| FB + Nextdoor Ads (targeted, managed) | $199/mo | `price_` ← create in dashboard |

### Pricing Mismatch to Fix

`types/financial.ts` defines `PACKAGE_PRICES` as:
- Budget: $299 (29900 cents)
- Premium: $799 (79900 cents)
- Elite: $1,999 (199900 cents)

But `Pricing.tsx` shows individual packages ($75-$2,000), not tier-level pricing. **Decision needed:** either update `PACKAGE_PRICES` to map each individual package ID to its price, or restructure the checkout flow to pass the specific package ID instead of just the tier.

**Recommended fix:** Change `PACKAGE_PRICES` to a per-package map, and pass the package ID (e.g., `cardcut`, `sales`, `ultimate`) to `createCheckoutSession` instead of the tier.

---

## Test Mode vs Live Mode Checklist

| Step | Test Mode | Live Mode |
|------|-----------|-----------|
| Stripe keys | `pk_test_` / `sk_test_` | `pk_live_` / `sk_live_` |
| Webhook secret | Test endpoint `whsec_` | Live endpoint `whsec_` |
| Test card | `4242 4242 4242 4242` any future exp, any CVC | Real cards |
| Webhook URL | Can use Stripe CLI local forwarding | Must be deployed HTTPS URL |
| Payouts | No real money moves | Real money to your bank |
| Products | Created in test mode | Must re-create in live mode (or use Stripe's copy feature) |

**Before flipping to live:**
- [ ] LLC registered
- [ ] EIN obtained
- [ ] Business bank account connected to Stripe
- [ ] All products/prices created in live mode
- [ ] Live webhook endpoint configured
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` set to `pk_live_` in Vercel production env
- [ ] `STRIPE_SECRET_KEY` set to `sk_live_` in Firebase production secrets
- [ ] `STRIPE_WEBHOOK_SECRET` updated for live webhook endpoint
- [ ] Test a real $1 transaction and refund it
- [ ] Verify payout arrives in bank account

---

## Quick Start (copy-paste commands)

### 1. Stripe.js is already installed (check)
```bash
# Already in package.json: "@stripe/stripe-js": "9.0.1"
# If somehow missing:
cd ~/xela-elite-ai-creative-studio && npm install @stripe/stripe-js
```

### 2. Firebase CLI + Functions setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Functions from project root
cd ~/xela-elite-ai-creative-studio
firebase init functions
# → Select existing project: inner-lightning-484702-r4
# → Language: TypeScript
# → ESLint: Yes
# → Install dependencies: Yes

# Install Stripe in Functions
cd functions && npm install stripe && cd ..
```

### 3. Set secrets
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# → paste sk_test_xxx

firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# → paste whsec_xxx
```

### 4. Deploy
```bash
firebase deploy --only functions
```

### 5. Test webhooks locally (while developing)
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local Firebase emulator
stripe listen --forward-to http://localhost:5001/inner-lightning-484702-r4/us-central1/stripeWebhook

# In another terminal, run Firebase emulators
cd ~/xela-elite-ai-creative-studio
firebase emulators:start --only functions

# Trigger a test event
stripe trigger checkout.session.completed
```

### 6. Test a checkout flow
```bash
# Start dev server
cd ~/xela-elite-ai-creative-studio && npm run dev

# Use test card: 4242 4242 4242 4242
# Any future expiration, any 3-digit CVC, any ZIP
```

---

## What to Build First (MVP in 30 Minutes)

If Firebase Functions are already set up, you only need **3 functions** to take money:

1. **`createCheckoutSession`** — 30 lines: validate input, call `stripe.checkout.sessions.create()`, return URL
2. **`stripeWebhook`** — 40 lines: verify signature, handle `checkout.session.completed`, write to Firestore
3. **`getPaymentStatus`** — 15 lines: call `stripe.checkout.sessions.retrieve()`, return status

Everything else (invoices, reports, forecasting) can come after the first dollar hits the bank.
