#!/bin/bash
# ============================================================================
# XELA Security Audit — macOS Quick Check (READ-ONLY, no changes made)
# Run: chmod +x scripts/security-audit.sh && ./scripts/security-audit.sh
# ============================================================================

PASS=0; FAIL=0; WARN=0
p() { echo "  ✅ PASS: $1"; ((PASS++)); }
f() { echo "  ❌ FAIL: $1"; ((FAIL++)); }
w() { echo "  ⚠️  WARN: $1"; ((WARN++)); }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  XELA SECURITY AUDIT — $(date '+%Y-%m-%d %H:%M')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. FileVault
echo "1. FileVault (Disk Encryption)"
fv=$(fdesetup status 2>/dev/null)
if echo "$fv" | grep -q "On"; then p "FileVault is ON"; else f "FileVault is OFF — enable in System Settings > Privacy & Security > FileVault"; fi

# 2. Firewall
echo "2. Firewall"
fw=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null)
if echo "$fw" | grep -q "enabled"; then p "Firewall is ON"; else f "Firewall is OFF — enable in System Settings > Network > Firewall"; fi

# 3. Gatekeeper
echo "3. Gatekeeper"
gk=$(spctl --status 2>/dev/null)
if echo "$gk" | grep -q "enabled"; then p "Gatekeeper is enabled"; else f "Gatekeeper is disabled"; fi

# 4. SIP
echo "4. System Integrity Protection"
sip=$(csrutil status 2>/dev/null)
if echo "$sip" | grep -q "enabled"; then p "SIP is enabled"; else f "SIP is disabled — this is a serious security risk"; fi

# 5. Auto-login
echo "5. Auto-Login"
al=$(defaults read /Library/Preferences/com.apple.loginwindow autoLoginUser 2>/dev/null)
if [ -z "$al" ] || echo "$al" | grep -q "does not exist"; then p "Auto-login is disabled"; else f "Auto-login is ENABLED for: $al"; fi

# 6. Screen lock
echo "6. Screen Lock After Sleep"
sl=$(sysadminctl -screenLock status 2>/dev/null)
if echo "$sl" | grep -qi "immediate\|on\|enabled"; then
  p "Screen lock is enabled"
elif [ -n "$sl" ]; then
  w "Screen lock status: $sl"
else
  # Fallback check
  ask=$(defaults read com.apple.screensaver askForPassword 2>/dev/null)
  if [ "$ask" = "1" ]; then p "Screen lock password required"; else w "Could not verify screen lock — check System Settings > Lock Screen"; fi
fi

# 7. Remote Login (SSH)
echo "7. Remote Login (SSH)"
ssh_status=$(systemsetup -getremotelogin 2>/dev/null)
if echo "$ssh_status" | grep -qi "off"; then p "Remote Login (SSH) is OFF"; else f "Remote Login (SSH) is ON — disable unless needed: System Settings > General > Sharing"; fi

# 8. Sharing Services
echo "8. Sharing Services"
sharing_issues=0
for svc in "File Sharing" "Screen Sharing" "Remote Management" "Printer Sharing" "Internet Sharing" "Bluetooth Sharing"; do
  # Check via launchctl or defaults
  case "$svc" in
    "File Sharing") check=$(launchctl list 2>/dev/null | grep -c "com.apple.smbd") ;;
    "Screen Sharing") check=$(launchctl list 2>/dev/null | grep -c "com.apple.screensharing") ;;
    "Remote Management") check=$(launchctl list 2>/dev/null | grep -c "com.apple.ARDAgent") ;;
    *) check=0 ;;
  esac
  if [ "$check" -gt 0 ]; then w "$svc appears to be ON"; ((sharing_issues++)); fi
done
if [ "$sharing_issues" -eq 0 ]; then p "No sharing services detected active"; fi

# 9. Find My Mac
echo "9. Find My Mac"
fmm=$(defaults read com.apple.FindMyMac FMMEnabled 2>/dev/null)
if [ "$fmm" = "1" ]; then p "Find My Mac is enabled"; else w "Find My Mac status unknown — verify in System Settings > Apple ID > Find My"; fi

# 10. Auto Updates
echo "10. Software Auto-Updates"
au=$(defaults read /Library/Preferences/com.apple.SoftwareUpdate AutomaticCheckEnabled 2>/dev/null)
if [ "$au" = "1" ]; then p "Auto software update check is ON"; else w "Auto update check may be off — verify in System Settings > General > Software Update"; fi

# 11. Exposed Secrets
echo "11. Exposed Secrets Scan"
secret_count=0

# .env files with keys
env_files=$(find ~ -maxdepth 3 -name ".env*" -not -path "*/node_modules/*" -not -path "*/.Trash/*" 2>/dev/null)
if [ -n "$env_files" ]; then
  while IFS= read -r ef; do
    if grep -qiE "(API_KEY|SECRET|PASSWORD|TOKEN).*=" "$ef" 2>/dev/null; then
      w "Secrets found in: $ef"
      ((secret_count++))
    fi
  done <<< "$env_files"
fi

# Plaintext API keys in common locations
key_files=$(grep -rlE "(GEMINI_API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|FIREBASE_API_KEY|STRIPE_SECRET)" ~/Desktop ~/Documents ~/Downloads --include="*.ts" --include="*.tsx" --include="*.js" --include="*.py" --include="*.json" --include="*.env*" -l 2>/dev/null | grep -v node_modules | head -10)
if [ -n "$key_files" ]; then
  while IFS= read -r kf; do
    w "Possible API key in: $kf"
    ((secret_count++))
  done <<< "$key_files"
fi

# Chrome passwords file
if [ -f ~/Documents/"Chrome Passwords.csv" ]; then
  f "Chrome passwords exported as plaintext CSV: ~/Documents/Chrome Passwords.csv — DELETE THIS FILE"
  ((secret_count++))
fi

# SSH keys without passphrase
for keyfile in ~/.ssh/id_*; do
  if [ -f "$keyfile" ] && [[ ! "$keyfile" == *.pub ]]; then
    if ssh-keygen -y -P "" -f "$keyfile" > /dev/null 2>&1; then
      w "SSH key without passphrase: $keyfile"
      ((secret_count++))
    fi
  fi
done

if [ "$secret_count" -eq 0 ]; then p "No exposed secrets found in quick scan"; fi

# 12. Git Config
echo "12. Git Configuration"
git_email=$(git config --global user.email 2>/dev/null)
git_name=$(git config --global user.name 2>/dev/null)
if [ -n "$git_email" ]; then p "Git email set: $git_email"; else w "Git email not set — commits may use system identity"; fi
if [ -n "$git_name" ]; then p "Git name set: $git_name"; else w "Git name not set"; fi

# 13. Homebrew outdated
echo "13. Homebrew Package Security"
if command -v brew &>/dev/null; then
  outdated=$(brew outdated 2>/dev/null | wc -l | tr -d ' ')
  if [ "$outdated" -gt 10 ]; then
    w "$outdated packages outdated — run 'brew upgrade' to update"
  elif [ "$outdated" -gt 0 ]; then
    p "$outdated packages have updates available (non-critical)"
  else
    p "All Homebrew packages up to date"
  fi
else
  p "Homebrew not installed (no package vulnerability risk)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RESULTS: $PASS passed | $FAIL failed | $WARN warnings"
TOTAL=$((PASS + FAIL + WARN))
if [ "$TOTAL" -gt 0 ]; then
  SCORE=$(( (PASS * 100) / TOTAL ))
  echo "  SCORE: ${SCORE}%"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "  ⚡ Fix the FAIL items first — these are active security gaps."
fi
if [ "$WARN" -gt 0 ]; then
  echo "  📋 Review WARN items when you get a chance."
fi
echo ""
