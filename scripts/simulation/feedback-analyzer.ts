/**
 * XELA Creative Branding Studio — Feedback Analyzer
 * Tracks system improvement over batches of 1,000 clients
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PipelineResult {
  clientId: string;
  industry: string;
  budget: string;
  location: string;
  referralSource: string;
  stages: any[];
  reachedStage: number;
  finalSatisfaction: number | null;
  npsScore: number | null;
  revisionCount: number | null;
  timeToApproval: number | null;
  packageSelected: string | null;
  upsellAccepted: boolean;
  referralGenerated: boolean;
  repeatPurchase: boolean;
  revenue: number;
  upsellRevenue: number;
}

interface BatchMetrics {
  batchNumber: number;
  clientRange: string;
  totalClients: number;
  clientsDelivered: number;
  avgRevisions: number;
  medianRevisions: number;
  avgSatisfaction: number;
  medianSatisfaction: number;
  avgTimeToApproval: number;
  satisfactionPct: number; // % scoring >= 7
  npsAvg: number;
  topRevisedElements: [string, number][];
  revenueTotal: number;
  upsellRate: number;
  referralRate: number;
}

interface IndustryMetrics {
  industry: string;
  totalDelivered: number;
  avgRevisions: number;
  avgSatisfaction: number;
  convergenceRate: number; // how fast revisions dropped
  firstBatchAvgRevisions: number;
  lastBatchAvgRevisions: number;
  topRevisedElements: [string, number][];
}

interface FeedbackAnalysis {
  batchMetrics: BatchMetrics[];
  industryMetrics: IndustryMetrics[];
  elementRevisionFrequency: Record<string, number>;
  improvementCurve: { batch: number; revisions: number; satisfaction: number }[];
  convergenceRanking: { industry: string; convergenceScore: number }[];
  optimalStrategies: { industry: string; recommendedVibe: string; recommendedFont: string; recommendedTone: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Analysis ───────────────────────────────────────────────────────────────────

function analyzeBatch(results: PipelineResult[], batchNum: number, batchSize: number): BatchMetrics {
  const start = (batchNum - 1) * batchSize;
  const end = Math.min(batchNum * batchSize, results.length);
  const batch = results.slice(start, end);

  const delivered = batch.filter(r => r.reachedStage >= 5);
  const revisions = delivered.map(r => r.revisionCount!).filter(v => v !== null);
  const satisfactions = delivered.map(r => r.finalSatisfaction!).filter(v => v !== null);
  const times = delivered.map(r => r.timeToApproval!).filter(v => v !== null);
  const npsScores = delivered.map(r => r.npsScore!).filter(v => v !== null);

  // Element revision tracking
  const elementCounts: Record<string, number> = {};
  for (const r of delivered) {
    const brandStage = r.stages.find(s => s.stage === 'brand_generation');
    if (brandStage?.details?.elementsRevised) {
      for (const el of brandStage.details.elementsRevised) {
        elementCounts[el] = (elementCounts[el] || 0) + 1;
      }
    }
  }
  const topElements = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [string, number][];

  return {
    batchNumber: batchNum,
    clientRange: `${start + 1}-${end}`,
    totalClients: batch.length,
    clientsDelivered: delivered.length,
    avgRevisions: revisions.length > 0 ? round2(revisions.reduce((a, b) => a + b, 0) / revisions.length) : 0,
    medianRevisions: median(revisions),
    avgSatisfaction: satisfactions.length > 0 ? round2(satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length) : 0,
    medianSatisfaction: median(satisfactions),
    avgTimeToApproval: times.length > 0 ? round2(times.reduce((a, b) => a + b, 0) / times.length) : 0,
    satisfactionPct: satisfactions.length > 0 ? round2(satisfactions.filter(s => s >= 7).length / satisfactions.length * 100) : 0,
    npsAvg: npsScores.length > 0 ? round2(npsScores.reduce((a, b) => a + b, 0) / npsScores.length) : 0,
    topRevisedElements: topElements,
    revenueTotal: delivered.reduce((sum, r) => sum + r.revenue, 0),
    upsellRate: delivered.length > 0 ? round2(delivered.filter(r => r.upsellAccepted).length / delivered.length * 100) : 0,
    referralRate: delivered.length > 0 ? round2(delivered.filter(r => r.referralGenerated).length / delivered.length * 100) : 0,
  };
}

function analyzeIndustry(results: PipelineResult[], industry: string, batchSize: number): IndustryMetrics {
  const industryResults = results.filter(r => r.industry === industry && r.reachedStage >= 5);

  const revisions = industryResults.map(r => r.revisionCount!);
  const satisfactions = industryResults.map(r => r.finalSatisfaction!);

  // First and last batch averages for convergence
  const firstChunk = industryResults.slice(0, Math.min(50, industryResults.length));
  const lastChunk = industryResults.slice(Math.max(0, industryResults.length - 50));

  const firstAvgRev = firstChunk.length > 0
    ? firstChunk.reduce((s, r) => s + r.revisionCount!, 0) / firstChunk.length
    : 0;
  const lastAvgRev = lastChunk.length > 0
    ? lastChunk.reduce((s, r) => s + r.revisionCount!, 0) / lastChunk.length
    : 0;

  const convergenceRate = firstAvgRev > 0 ? round2((firstAvgRev - lastAvgRev) / firstAvgRev * 100) : 0;

  // Element tracking
  const elementCounts: Record<string, number> = {};
  for (const r of industryResults) {
    const brandStage = r.stages.find((s: any) => s.stage === 'brand_generation');
    if (brandStage?.details?.elementsRevised) {
      for (const el of brandStage.details.elementsRevised) {
        elementCounts[el] = (elementCounts[el] || 0) + 1;
      }
    }
  }

  return {
    industry,
    totalDelivered: industryResults.length,
    avgRevisions: revisions.length > 0 ? round2(revisions.reduce((a, b) => a + b, 0) / revisions.length) : 0,
    avgSatisfaction: satisfactions.length > 0 ? round2(satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length) : 0,
    convergenceRate,
    firstBatchAvgRevisions: round2(firstAvgRev),
    lastBatchAvgRevisions: round2(lastAvgRev),
    topRevisedElements: Object.entries(elementCounts).sort((a, b) => b[1] - a[1]).slice(0, 3) as [string, number][],
  };
}

// ── Main ───────────────────────────────────────────────────────────────────────

const outDir = join(import.meta.dirname!, '..', '..', 'output', 'simulation');
mkdirSync(outDir, { recursive: true });

console.log('Loading pipeline results...');
const results: PipelineResult[] = JSON.parse(
  readFileSync(join(outDir, 'pipeline-results.json'), 'utf-8'),
);
console.log(`Loaded ${results.length.toLocaleString()} results\n`);

const BATCH_SIZE = 1000;
const numBatches = Math.ceil(results.length / BATCH_SIZE);

// Batch analysis
console.log('Analyzing batches...');
const batchMetrics: BatchMetrics[] = [];
for (let b = 1; b <= numBatches; b++) {
  const metrics = analyzeBatch(results, b, BATCH_SIZE);
  batchMetrics.push(metrics);
  console.log(
    `  Batch ${String(b).padStart(2, ' ')} (${metrics.clientRange}): ` +
    `avg ${metrics.avgRevisions.toFixed(1)} revisions, ` +
    `${metrics.satisfactionPct.toFixed(0)}% satisfied, ` +
    `$${metrics.revenueTotal.toLocaleString()} revenue`,
  );
}

// Industry analysis
console.log('\nAnalyzing industries...');
const industries = [...new Set(results.map(r => r.industry))];
const industryMetrics: IndustryMetrics[] = [];
for (const ind of industries) {
  const metrics = analyzeIndustry(results, ind, BATCH_SIZE);
  industryMetrics.push(metrics);
}
industryMetrics.sort((a, b) => b.convergenceRate - a.convergenceRate);

console.log('\nIndustry Convergence Ranking:');
for (const im of industryMetrics) {
  console.log(
    `  ${im.industry.padEnd(20)} ${im.convergenceRate.toFixed(1)}% improvement ` +
    `(${im.firstBatchAvgRevisions.toFixed(1)} -> ${im.lastBatchAvgRevisions.toFixed(1)} revisions)`,
  );
}

// Element revision frequency
const globalElementCounts: Record<string, number> = {};
for (const r of results.filter(r => r.reachedStage >= 4)) {
  const brandStage = r.stages.find((s: any) => s.stage === 'brand_generation');
  if (brandStage?.details?.elementsRevised) {
    for (const el of brandStage.details.elementsRevised) {
      globalElementCounts[el] = (globalElementCounts[el] || 0) + 1;
    }
  }
}

// Improvement curve
const improvementCurve = batchMetrics.map(bm => ({
  batch: bm.batchNumber,
  revisions: bm.avgRevisions,
  satisfaction: bm.avgSatisfaction,
}));

// Convergence ranking
const convergenceRanking = industryMetrics.map(im => ({
  industry: im.industry,
  convergenceScore: im.convergenceRate,
}));

// Optimal first-draft strategies per industry
// Derived from the preference snapshots — here we approximate from result data
const optimalStrategies: { industry: string; recommendedVibe: string; recommendedFont: string; recommendedTone: string }[] = [];

for (const ind of industries) {
  const indResults = results.filter(r => r.industry === ind && r.finalSatisfaction !== null && r.finalSatisfaction >= 8);
  if (indResults.length === 0) continue;

  // Load the client data to get preferences of highly satisfied clients
  const clientsData: any[] = JSON.parse(
    readFileSync(join(outDir, 'synthetic-clients.json'), 'utf-8'),
  );
  const clientMap = new Map(clientsData.map(c => [c.id, c]));

  const vibeVotes: Record<string, number> = {};
  const fontVotes: Record<string, number> = {};
  const toneVotes: Record<string, number> = {};

  for (const r of indResults) {
    const c = clientMap.get(r.clientId);
    if (!c) continue;
    vibeVotes[c.vibe] = (vibeVotes[c.vibe] || 0) + 1;
    fontVotes[c.preferences.font_style] = (fontVotes[c.preferences.font_style] || 0) + 1;
    toneVotes[c.preferences.tone] = (toneVotes[c.preferences.tone] || 0) + 1;
  }

  const topVibe = Object.entries(vibeVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clean';
  const topFont = Object.entries(fontVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'sans';
  const topTone = Object.entries(toneVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'professional';

  optimalStrategies.push({
    industry: ind,
    recommendedVibe: topVibe,
    recommendedFont: topFont,
    recommendedTone: topTone,
  });
}

// ── Save Analysis ──────────────────────────────────────────────────────────────

const analysis: FeedbackAnalysis = {
  batchMetrics,
  industryMetrics,
  elementRevisionFrequency: globalElementCounts,
  improvementCurve,
  convergenceRanking,
  optimalStrategies,
};

const analysisPath = join(outDir, 'feedback-analysis.json');
writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
console.log(`\nWrote feedback analysis to ${analysisPath}`);
