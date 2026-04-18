#!/usr/bin/env bash
# ─── Environment Variable Setup Check — XELA Creative Branding Studio ───
# Checks which required env vars are set on Vercel and lists what's missing.

set -euo pipefail

REQUIRED_VARS=(
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "VITE_STRIPE_PUBLISHABLE_KEY"
  "FIREBASE_PROJECT_ID"
  "FIREBASE_SERVICE_ACCOUNT_KEY"
  "GEMINI_API_KEY"
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_AUTH_DOMAIN"
  "VITE_FIREBASE_PROJECT_ID"
  "VITE_FIREBASE_STORAGE_BUCKET"
  "VITE_FIREBASE_MESSAGING_SENDER_ID"
  "VITE_FIREBASE_APP_ID"
)

echo "═══════════════════════════════════════════════════"
echo "  XELA Creative Branding Studio — Env Var Checker"
echo "═══════════════════════════════════════════════════"
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
  echo "ERROR: vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

echo "Fetching env vars from Vercel..."
echo ""

VERCEL_VARS=$(vercel env ls 2>/dev/null || echo "FETCH_FAILED")

if [ "$VERCEL_VARS" = "FETCH_FAILED" ]; then
  echo "ERROR: Could not fetch Vercel env vars."
  echo "  - Run 'vercel login' first"
  echo "  - Run 'vercel link' in the project directory"
  exit 1
fi

MISSING=()
SET=()

for var in "${REQUIRED_VARS[@]}"; do
  if echo "$VERCEL_VARS" | grep -q "$var"; then
    SET+=("$var")
  else
    MISSING+=("$var")
  fi
done

echo "SET (${#SET[@]}/${#REQUIRED_VARS[@]}):"
for var in "${SET[@]}"; do
  echo "  ✓ $var"
done

echo ""

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "All required environment variables are configured."
  exit 0
fi

echo "MISSING (${#MISSING[@]}):"
for var in "${MISSING[@]}"; do
  echo "  ✗ $var"
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  How to add missing variables:"
echo "═══════════════════════════════════════════════════"
echo ""

for var in "${MISSING[@]}"; do
  case "$var" in
    STRIPE_SECRET_KEY)
      echo "$var:"
      echo "  Get from https://dashboard.stripe.com/apikeys"
      echo "  vercel env add STRIPE_SECRET_KEY production"
      ;;
    STRIPE_WEBHOOK_SECRET)
      echo "$var:"
      echo "  Get from https://dashboard.stripe.com/webhooks after creating endpoint"
      echo "  vercel env add STRIPE_WEBHOOK_SECRET production"
      ;;
    VITE_STRIPE_PUBLISHABLE_KEY)
      echo "$var:"
      echo "  Get from https://dashboard.stripe.com/apikeys (publishable key)"
      echo "  vercel env add VITE_STRIPE_PUBLISHABLE_KEY production"
      ;;
    FIREBASE_PROJECT_ID)
      echo "$var:"
      echo "  Get from https://console.firebase.google.com → Project settings"
      echo "  vercel env add FIREBASE_PROJECT_ID production"
      ;;
    FIREBASE_SERVICE_ACCOUNT_KEY)
      echo "$var:"
      echo "  Get from Firebase Console → Project settings → Service accounts → Generate new private key"
      echo "  Paste the ENTIRE JSON as a single line"
      echo "  vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production"
      ;;
    GEMINI_API_KEY)
      echo "$var:"
      echo "  Get from https://aistudio.google.com/apikey"
      echo "  vercel env add GEMINI_API_KEY production"
      ;;
    VITE_FIREBASE_*)
      echo "$var:"
      echo "  Get from Firebase Console → Project settings → Your apps → SDK config"
      echo "  vercel env add $var production"
      ;;
    *)
      echo "$var:"
      echo "  vercel env add $var production"
      ;;
  esac
  echo ""
done

echo "After adding variables, run: vercel deploy --prod"
