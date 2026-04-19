#!/bin/bash
# encrypt-local.sh — Encrypt sensitive behavioral profiles
# Snowden Principle: "Your skill usage pattern IS your threat model"
#
# Usage: bash ~/xela-creative-branding-studio/scripts/encrypt-local.sh
# You will be prompted for an encryption password (twice: once per archive).
# Keep that password safe — there is NO recovery without it.

set -euo pipefail

echo "=== Local Data Encryption ==="
echo ""

# --- Skill metrics ---
METRICS_DIR="$HOME/.claude/skills/_metrics"
METRICS_ENC="$HOME/.claude/skills/_metrics.enc"

if [ -d "$METRICS_DIR" ]; then
  FILE_COUNT=$(find "$METRICS_DIR" -type f | wc -l | tr -d ' ')
  echo "[FOUND] Skill metrics at ~/.claude/skills/_metrics/"
  echo "  $FILE_COUNT files — these profile which skills you use (a behavioral fingerprint)."
  read -p "  Encrypt and remove plaintext? (y/N): " confirm
  if [ "$confirm" = "y" ]; then
    echo "  Encrypting with AES-256-CBC (you will be prompted for a password)..."
    tar czf - -C "$HOME/.claude/skills" _metrics | \
      openssl enc -aes-256-cbc -salt -pbkdf2 -out "$METRICS_ENC"
    if [ $? -eq 0 ]; then
      rm -rf "$METRICS_DIR"
      echo "  [DONE] Encrypted to $METRICS_ENC"
      echo "  [DONE] Plaintext originals removed."
    else
      echo "  [ERROR] Encryption failed. Originals preserved."
    fi
  else
    echo "  [SKIP] No changes made."
  fi
else
  echo "[CLEAN] No skill metrics found at ~/.claude/skills/_metrics/"
fi

echo ""

# --- Automation logs ---
LOGS_DIR="$HOME/automation_logs"
LOGS_ENC="$HOME/automation_logs.enc"

if [ -d "$LOGS_DIR" ]; then
  FILE_COUNT=$(find "$LOGS_DIR" -type f | wc -l | tr -d ' ')
  echo "[FOUND] Automation logs at ~/automation_logs/"
  echo "  $FILE_COUNT files — these map your automation patterns."
  read -p "  Encrypt and remove plaintext? (y/N): " confirm
  if [ "$confirm" = "y" ]; then
    echo "  Encrypting with AES-256-CBC (you will be prompted for a password)..."
    tar czf - -C "$HOME" automation_logs | \
      openssl enc -aes-256-cbc -salt -pbkdf2 -out "$LOGS_ENC"
    if [ $? -eq 0 ]; then
      rm -rf "$LOGS_DIR"
      echo "  [DONE] Encrypted to $LOGS_ENC"
      echo "  [DONE] Plaintext originals removed."
    else
      echo "  [ERROR] Encryption failed. Originals preserved."
    fi
  else
    echo "  [SKIP] No changes made."
  fi
else
  echo "[CLEAN] No automation logs found at ~/automation_logs/"
fi

echo ""
echo "=== Encryption Complete ==="
echo ""
echo "To decrypt later:"
echo "  openssl enc -d -aes-256-cbc -pbkdf2 -in ~/.claude/skills/_metrics.enc | tar xzf - -C ~/.claude/skills/"
echo "  openssl enc -d -aes-256-cbc -pbkdf2 -in ~/automation_logs.enc | tar xzf - -C ~/"
echo ""
echo "Reminder: Keep your decryption password safe. No recovery without it."
