#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_DIR"

echo "============================================"
echo "  XELA Pipeline Simulation Engine v1.0"
echo "  Brevard County, FL — 20,000 Clients"
echo "============================================"
echo ""

echo "[1/4] Generating 20,000 synthetic clients..."
npx tsx scripts/simulation/generate-clients.ts
echo ""

echo "[2/4] Running pipeline simulation..."
npx tsx scripts/simulation/simulate-pipeline.ts
echo ""

echo "[3/4] Analyzing feedback patterns..."
npx tsx scripts/simulation/feedback-analyzer.ts
echo ""

echo "[4/4] Generating report..."
npx tsx scripts/simulation/report-generator.ts
echo ""

echo "============================================"
echo "  Simulation complete!"
echo "  Report: output/simulation/simulation-report.md"
echo "============================================"
