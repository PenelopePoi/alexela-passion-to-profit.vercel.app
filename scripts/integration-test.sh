#!/bin/bash
# XELA Integration Test Script
# Verifies the built site is production-ready

set -e

PROJECT_DIR="/Users/TroubleshootGuest/xela-creative-branding-studio"
cd "$PROJECT_DIR"

PASS=0
FAIL=0
RESULTS=()

pass() { RESULTS+=("✅ $1"); PASS=$((PASS+1)); }
fail() { RESULTS+=("❌ $1"); FAIL=$((FAIL+1)); }

echo "🧪 XELA Integration Test — $(date)"
echo "=============================================="
echo ""

# 1. TypeScript check
echo "1. TypeScript check..."
if npx tsc --noEmit 2>&1 | grep -q "error"; then
  fail "TypeScript errors found"
else
  pass "Zero TypeScript errors"
fi

# 2. Build check
echo "2. Build check..."
if npx vite build 2>&1 | tail -5 | grep -q "built in"; then
  pass "Vite build successful"
else
  fail "Vite build failed"
fi

# 3. Check for old email (literal match with -q for proper exit code)
echo "3. Email reference check..."
if grep -rqF "xelacreativestudio@gmail.com" dist/ 2>/dev/null; then
  fail "Old email xelacreativestudio@gmail.com found in dist/"
else
  pass "Old email not in dist/"
fi

# 4. Check for S.L.U.G.S. (literal string match)
echo "4. S.L.U.G.S. reference check..."
if grep -rqF "S.L.U.G.S." dist/ 2>/dev/null; then
  fail "S.L.U.G.S. still present in dist/"
elif grep -rqF "Soldiers Living Under" dist/ 2>/dev/null; then
  fail "'Soldiers Living Under' phrase still present in dist/"
else
  pass "S.L.U.G.S. removed from dist/"
fi

# 5. Check for new email
echo "5. New email reference check..."
if grep -rqF "xelabrandingstudio@gmail.com" dist/ 2>/dev/null; then
  pass "New email xelabrandingstudio@gmail.com present in dist/"
else
  fail "New email not found in dist/"
fi

# 6. Check logo file exists
echo "6. Logo file check..."
if [ -f "public/xela-logo-final.png" ]; then
  pass "XELA logo exists"
else
  fail "XELA logo missing"
fi

# 7. Check critical components exist
echo "7. Critical files check..."
REQUIRED=(
  "components/ConsultationWizard.tsx"
  "components/ChatIntake.tsx"
  "components/IntakeVariants.tsx"
  "components/IntakeShuffler.tsx"
  "components/SubmissionsInbox.tsx"
  "components/LicenseModal.tsx"
  "services/submissionLog.ts"
  "services/authGuard.ts"
  "services/studioLicense.ts"
  "public/intake.html"
  "public/consult.html"
)
MISSING=0
for file in "${REQUIRED[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING=$((MISSING+1))
    RESULTS+=("❌ Missing: $file")
  fi
done
if [ $MISSING -eq 0 ]; then
  pass "All ${#REQUIRED[@]} critical files present"
else
  fail "$MISSING critical files missing"
fi

# 8. PII leak check
echo "8. PII leak check..."
PII_HITS=$(grep -rE "console\.log.*\b(email|phone|password)\b" components/ services/ App.tsx 2>/dev/null | grep -v "// " | wc -l | tr -d ' ')
if [ "$PII_HITS" = "0" ]; then
  pass "No PII leaks in console.log"
else
  fail "$PII_HITS potential PII leak(s) in console.log"
fi

# 9. Build size check (should be reasonable)
echo "9. Build size check..."
if [ -d "dist" ]; then
  SIZE=$(du -sh dist 2>/dev/null | cut -f1)
  pass "Build size: $SIZE"
fi

# 10. Deploy readiness
echo "10. Deploy readiness..."
if [ -f "vercel.json" ]; then
  pass "vercel.json present"
else
  fail "vercel.json missing"
fi

echo ""
echo "=============================================="
for result in "${RESULTS[@]}"; do
  echo "$result"
done
echo "=============================================="
echo "$PASS passed, $FAIL failed"
echo ""

if [ $FAIL -gt 0 ]; then
  exit 1
fi
exit 0
