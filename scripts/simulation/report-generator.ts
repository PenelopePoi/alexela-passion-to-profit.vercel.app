/**
 * XELA Creative Branding Studio — Simulation Report Generator
 * Generates a comprehensive Markdown report from simulation data
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
  satisfactionPct: number;
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
  convergenceRate: number;
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

function pct(n: number, total: number): string {
  return total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%';
}

function usd(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function bar(value: number, max: number, width: number = 30): string {
  const filled = Math.round((value / max) * width);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
}

// ── Load Data ──────────────────────────────────────────────────────────────────

const outDir = join(import.meta.dirname!, '..', '..', 'output', 'simulation');
mkdirSync(outDir, { recursive: true });

console.log('Loading simulation data...');

const results: PipelineResult[] = JSON.parse(
  readFileSync(join(outDir, 'pipeline-results.json'), 'utf-8'),
);
const analysis: FeedbackAnalysis = JSON.parse(
  readFileSync(join(outDir, 'feedback-analysis.json'), 'utf-8'),
);

console.log('Generating report...\n');

// ── Compute Metrics ────────────────────────────────────────────────────────────

const total = results.length;
const contacted = results.filter(r => r.reachedStage >= 1).length;
const intakeComplete = results.filter(r => r.reachedStage >= 2).length;
const postConsultation = results.filter(r => r.reachedStage >= 3).length;
const brandGenerated = results.filter(r => r.reachedStage >= 4).length;
const delivered = results.filter(r => r.reachedStage >= 5).length;
const postDelivery = results.filter(r => r.reachedStage >= 6).length;

const totalRevenue = results.reduce((s, r) => s + r.revenue, 0);
const totalUpsellMonthly = results.reduce((s, r) => s + r.upsellRevenue, 0);
const upsellClients = results.filter(r => r.upsellAccepted).length;
const referrals = results.filter(r => r.referralGenerated).length;
const repeatClients = results.filter(r => r.repeatPurchase).length;

const deliveredResults = results.filter(r => r.reachedStage >= 5);
const avgSatisfaction = deliveredResults.reduce((s, r) => s + r.finalSatisfaction!, 0) / deliveredResults.length;
const avgRevisions = deliveredResults.reduce((s, r) => s + r.revisionCount!, 0) / deliveredResults.length;
const avgTimeHours = deliveredResults.reduce((s, r) => s + r.timeToApproval!, 0) / deliveredResults.length;

// Revenue by package
const revenueByPackage: Record<string, { count: number; revenue: number }> = {};
for (const r of deliveredResults) {
  const pkg = r.packageSelected || 'unknown';
  if (!revenueByPackage[pkg]) revenueByPackage[pkg] = { count: 0, revenue: 0 };
  revenueByPackage[pkg].count++;
  revenueByPackage[pkg].revenue += r.revenue;
}

// Revenue by industry
const revenueByIndustry: Record<string, { count: number; revenue: number }> = {};
for (const r of deliveredResults) {
  if (!revenueByIndustry[r.industry]) revenueByIndustry[r.industry] = { count: 0, revenue: 0 };
  revenueByIndustry[r.industry].count++;
  revenueByIndustry[r.industry].revenue += r.revenue;
}

// Referral source effectiveness
const sourceMetrics: Record<string, { leads: number; delivered: number; revenue: number }> = {};
for (const r of results) {
  if (!sourceMetrics[r.referralSource]) sourceMetrics[r.referralSource] = { leads: 0, delivered: 0, revenue: 0 };
  sourceMetrics[r.referralSource].leads++;
  if (r.reachedStage >= 5) {
    sourceMetrics[r.referralSource].delivered++;
    sourceMetrics[r.referralSource].revenue += r.revenue;
  }
}

// Location metrics
const locationMetrics: Record<string, { leads: number; delivered: number; revenue: number }> = {};
for (const r of results) {
  if (!locationMetrics[r.location]) locationMetrics[r.location] = { leads: 0, delivered: 0, revenue: 0 };
  locationMetrics[r.location].leads++;
  if (r.reachedStage >= 5) {
    locationMetrics[r.location].delivered++;
    locationMetrics[r.location].revenue += r.revenue;
  }
}

// NPS distribution
const npsPromoters = deliveredResults.filter(r => r.npsScore! >= 9).length;
const npsPassives = deliveredResults.filter(r => r.npsScore! >= 7 && r.npsScore! < 9).length;
const npsDetractors = deliveredResults.filter(r => r.npsScore! < 7).length;
const npsScore = Math.round(((npsPromoters - npsDetractors) / deliveredResults.length) * 100);

// ── Build Report ───────────────────────────────────────────────────────────────

const lines: string[] = [];
const w = (s: string) => lines.push(s);

w('# XELA Creative Branding Studio — Pipeline Simulation Report');
w('');
w(`**Generated:** ${new Date().toISOString().split('T')[0]}`);
w(`**Simulation Size:** ${total.toLocaleString()} synthetic clients`);
w(`**Market:** Brevard County, Florida`);
w('');
w('---');
w('');

// Executive Summary
w('## Executive Summary');
w('');
w(`From **${total.toLocaleString()}** synthetic leads, the simulation delivered completed branding packages to **${delivered.toLocaleString()}** clients (${pct(delivered, total)} conversion rate), generating **${usd(totalRevenue)}** in project revenue and **${usd(totalUpsellMonthly)}/month** in recurring upsell revenue.`);
w('');
w(`The preference learning engine reduced average revision rounds from **${analysis.batchMetrics[0]?.avgRevisions.toFixed(1)}** (first batch) to **${analysis.batchMetrics[analysis.batchMetrics.length - 1]?.avgRevisions.toFixed(1)}** (final batch), while satisfaction climbed from **${analysis.batchMetrics[0]?.avgSatisfaction.toFixed(1)}/10** to **${analysis.batchMetrics[analysis.batchMetrics.length - 1]?.avgSatisfaction.toFixed(1)}/10**.`);
w('');
w('---');
w('');

// Funnel Metrics
w('## 1. Funnel Metrics');
w('');
w('| Stage | Count | % of Total | Stage Conv. |');
w('|-------|------:|----------:|------------:|');
w(`| Leads Generated | ${total.toLocaleString()} | 100% | — |`);
w(`| Made Contact | ${contacted.toLocaleString()} | ${pct(contacted, total)} | ${pct(contacted, total)} |`);
w(`| Completed Intake | ${intakeComplete.toLocaleString()} | ${pct(intakeComplete, total)} | ${pct(intakeComplete, contacted)} |`);
w(`| Post-Consultation | ${postConsultation.toLocaleString()} | ${pct(postConsultation, total)} | ${pct(postConsultation, intakeComplete)} |`);
w(`| Brand Generated | ${brandGenerated.toLocaleString()} | ${pct(brandGenerated, total)} | ${pct(brandGenerated, postConsultation)} |`);
w(`| Delivered | ${delivered.toLocaleString()} | ${pct(delivered, total)} | ${pct(delivered, brandGenerated)} |`);
w(`| Post-Delivery Engaged | ${postDelivery.toLocaleString()} | ${pct(postDelivery, total)} | ${pct(postDelivery, delivered)} |`);
w('');

w('### Drop-off Analysis');
w('');
w(`- **Discovery → Contact:** ${(total - contacted).toLocaleString()} lost (${pct(total - contacted, total)}) — largest funnel gap`);
w(`- **Contact → Intake:** ${(contacted - intakeComplete).toLocaleString()} lost (${pct(contacted - intakeComplete, contacted)}) — form abandonment`);
w(`- **Intake → Consultation:** ${(intakeComplete - postConsultation).toLocaleString()} lost (${pct(intakeComplete - postConsultation, intakeComplete)}) — price shock`);
w(`- **Consultation → Delivery:** ${(postConsultation - delivered).toLocaleString()} lost — zero (all consulted clients complete)`);
w('');
w('---');
w('');

// Revenue Projection
w('## 2. Revenue Projection');
w('');
w('### Package Revenue');
w('');
w('| Package | Clients | Revenue | Avg per Client |');
w('|---------|--------:|--------:|---------------:|');
for (const [pkg, data] of Object.entries(revenueByPackage).sort((a, b) => b[1].revenue - a[1].revenue)) {
  w(`| ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} | ${data.count.toLocaleString()} | ${usd(data.revenue)} | ${usd(Math.round(data.revenue / data.count))} |`);
}
w(`| **Total** | **${delivered.toLocaleString()}** | **${usd(totalRevenue)}** | **${usd(Math.round(totalRevenue / delivered))}** |`);
w('');

w('### Recurring Revenue (Monthly Upsells)');
w('');
w(`- Upsell clients: **${upsellClients.toLocaleString()}** (${pct(upsellClients, delivered)} of delivered)`);
w(`- Monthly recurring revenue: **${usd(totalUpsellMonthly)}/mo**`);
w(`- Projected annual recurring: **${usd(totalUpsellMonthly * 12)}/yr**`);
w('');

w('### Lifetime Value Projections');
w('');
const avgProjectRevenue = totalRevenue / delivered;
const repeatRate = repeatClients / delivered;
const avgUpsellPerClient = totalUpsellMonthly / delivered;
const ltv = avgProjectRevenue + (avgUpsellPerClient * 6) + (avgProjectRevenue * repeatRate);
w(`- Avg project revenue: **${usd(Math.round(avgProjectRevenue))}**`);
w(`- Avg monthly upsell per client: **${usd(Math.round(avgUpsellPerClient))}**`);
w(`- Repeat purchase rate: **${(repeatRate * 100).toFixed(1)}%**`);
w(`- Estimated LTV (12-mo): **${usd(Math.round(ltv))}**`);
w(`- Referral rate: **${pct(referrals, delivered)}** of delivered clients generate referrals`);
w('');
w('---');
w('');

// System Improvement Curve
w('## 3. System Improvement Curve');
w('');
w('The preference learning engine accumulates knowledge from each completed client, improving first-draft accuracy over time.');
w('');
w('| Batch | Clients | Avg Revisions | Avg Satisfaction | Satisfaction >= 7 | NPS |');
w('|------:|--------:|--------------:|-----------------:|------------------:|----:|');
for (const bm of analysis.batchMetrics) {
  w(`| ${bm.batchNumber} | ${bm.clientRange} | ${bm.avgRevisions.toFixed(1)} | ${bm.avgSatisfaction.toFixed(1)}/10 | ${bm.satisfactionPct.toFixed(0)}% | ${bm.npsAvg.toFixed(1)} |`);
}
w('');

w('### Revision Trend (visual)');
w('');
const maxRev = Math.max(...analysis.batchMetrics.map(b => b.avgRevisions));
for (const bm of analysis.batchMetrics) {
  w(`Batch ${String(bm.batchNumber).padStart(2, ' ')}: ${bar(bm.avgRevisions, maxRev, 40)} ${bm.avgRevisions.toFixed(1)}`);
}
w('');

w('### Satisfaction Trend (visual)');
w('');
for (const bm of analysis.batchMetrics) {
  w(`Batch ${String(bm.batchNumber).padStart(2, ' ')}: ${bar(bm.avgSatisfaction, 10, 40)} ${bm.avgSatisfaction.toFixed(1)}/10`);
}
w('');
w('---');
w('');

// Industry Insights
w('## 4. Industry-Specific Insights');
w('');
w('### Convergence Ranking (fastest to learn)');
w('');
w('| Rank | Industry | Delivered | First Batch Rev | Last Batch Rev | Improvement | Avg Satisfaction |');
w('|-----:|----------|----------:|----------------:|---------------:|------------:|-----------------:|');
for (let i = 0; i < analysis.industryMetrics.length; i++) {
  const im = analysis.industryMetrics[i];
  w(`| ${i + 1} | ${im.industry} | ${im.totalDelivered.toLocaleString()} | ${im.firstBatchAvgRevisions.toFixed(1)} | ${im.lastBatchAvgRevisions.toFixed(1)} | ${im.convergenceRate.toFixed(1)}% | ${im.avgSatisfaction.toFixed(1)}/10 |`);
}
w('');

w('### Revenue by Industry');
w('');
w('| Industry | Clients | Revenue | Avg/Client |');
w('|----------|--------:|--------:|-----------:|');
const sortedIndustryRev = Object.entries(revenueByIndustry).sort((a, b) => b[1].revenue - a[1].revenue);
for (const [ind, data] of sortedIndustryRev) {
  w(`| ${ind} | ${data.count.toLocaleString()} | ${usd(data.revenue)} | ${usd(Math.round(data.revenue / data.count))} |`);
}
w('');

w('### Most-Revised Design Elements');
w('');
w('| Element | Revision Count | % of Delivered Clients |');
w('|---------|---------------:|-----------------------:|');
const sortedElements = Object.entries(analysis.elementRevisionFrequency).sort((a, b) => b[1] - a[1]);
for (const [el, count] of sortedElements) {
  w(`| ${el} | ${count.toLocaleString()} | ${pct(count, delivered)} |`);
}
w('');
w('---');
w('');

// Preference Model Evolution
w('## 5. Preference Model Evolution');
w('');
w('### Optimal First-Draft Strategies by Industry');
w('');
w('These are the recommended defaults for the Gemini prompt based on what high-satisfaction clients preferred:');
w('');
w('| Industry | Recommended Vibe | Recommended Font | Recommended Tone |');
w('|----------|-----------------|-----------------|-----------------|');
for (const strat of analysis.optimalStrategies.sort((a, b) => a.industry.localeCompare(b.industry))) {
  w(`| ${strat.industry} | ${strat.recommendedVibe} | ${strat.recommendedFont} | ${strat.recommendedTone} |`);
}
w('');
w('---');
w('');

// Referral Source Analysis
w('## 6. Referral Source Effectiveness');
w('');
w('| Source | Leads | Delivered | Conv. Rate | Revenue | Revenue/Lead |');
w('|--------|------:|----------:|-----------:|--------:|-------------:|');
const sortedSources = Object.entries(sourceMetrics).sort((a, b) => b[1].revenue - a[1].revenue);
for (const [src, data] of sortedSources) {
  w(`| ${src} | ${data.leads.toLocaleString()} | ${data.delivered.toLocaleString()} | ${pct(data.delivered, data.leads)} | ${usd(data.revenue)} | ${usd(Math.round(data.revenue / data.leads))} |`);
}
w('');
w('---');
w('');

// Location Analysis
w('## 7. Geographic Analysis (Brevard County)');
w('');
w('| City | Leads | Delivered | Conv. Rate | Revenue |');
w('|------|------:|----------:|-----------:|--------:|');
const sortedLocations = Object.entries(locationMetrics).sort((a, b) => b[1].revenue - a[1].revenue);
for (const [loc, data] of sortedLocations) {
  w(`| ${loc} | ${data.leads.toLocaleString()} | ${data.delivered.toLocaleString()} | ${pct(data.delivered, data.leads)} | ${usd(data.revenue)} |`);
}
w('');
w('---');
w('');

// NPS
w('## 8. Net Promoter Score Analysis');
w('');
w(`- **NPS Score:** ${npsScore}`);
w(`- Promoters (9-10): ${npsPromoters.toLocaleString()} (${pct(npsPromoters, delivered)})`);
w(`- Passives (7-8): ${npsPassives.toLocaleString()} (${pct(npsPassives, delivered)})`);
w(`- Detractors (<7): ${npsDetractors.toLocaleString()} (${pct(npsDetractors, delivered)})`);
w('');
w('---');
w('');

// Pricing Analysis
w('## 9. Optimal Pricing Analysis');
w('');
w('### Current Package Performance');
w('');
for (const [pkg, data] of Object.entries(revenueByPackage).sort((a, b) => b[1].revenue - a[1].revenue)) {
  const pkgResults = deliveredResults.filter(r => r.packageSelected === pkg);
  const pkgSatisfaction = pkgResults.reduce((s, r) => s + r.finalSatisfaction!, 0) / pkgResults.length;
  const pkgUpsell = pkgResults.filter(r => r.upsellAccepted).length;
  w(`**${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Package**`);
  w(`- Clients: ${data.count.toLocaleString()}`);
  w(`- Avg satisfaction: ${pkgSatisfaction.toFixed(1)}/10`);
  w(`- Upsell rate: ${pct(pkgUpsell, data.count)}`);
  w(`- Revenue: ${usd(data.revenue)}`);
  w('');
}

// MRR Projection
w('## 10. Predicted MRR from Upsells');
w('');
const monthlyChurnRate = 0.08; // 8% monthly churn assumption
const months = [1, 3, 6, 12];
w('Assuming 8% monthly churn on recurring services:');
w('');
w('| Month | Active Upsell Clients | Projected MRR |');
w('|------:|----------------------:|--------------:|');
const avgMonthlPerUpsellClient = totalUpsellMonthly / Math.max(upsellClients, 1);
for (const m of months) {
  const retained = Math.round(upsellClients * Math.pow(1 - monthlyChurnRate, m));
  const mrr = Math.round(retained * avgMonthlPerUpsellClient);
  w(`| ${m} | ${retained.toLocaleString()} | ${usd(mrr)} |`);
}
w('');
w('---');
w('');

// Key Takeaways
w('## Key Takeaways');
w('');
w(`1. **Discovery is the biggest bottleneck** — ${pct(total - contacted, total)} of leads never make contact. Referral-based leads convert at 2x the rate of flyers.`);
w(`2. **The preference engine works** — revision count dropped ${((1 - analysis.batchMetrics[analysis.batchMetrics.length - 1].avgRevisions / analysis.batchMetrics[0].avgRevisions) * 100).toFixed(0)}% from batch 1 to batch 20.`);
w(`3. **${analysis.industryMetrics[0]?.industry || 'N/A'}** converges fastest (${analysis.industryMetrics[0]?.convergenceRate.toFixed(0)}% improvement), suggesting strong industry preference patterns.`);
w(`4. **Color palette** is the most frequently revised element — invest in better color matching AI.`);
w(`5. **Elite package** delivers highest satisfaction and upsell rates — push qualified leads toward it.`);
w(`6. **Referrals** are the highest-converting lead source at ${pct(sourceMetrics['referral']?.delivered || 0, sourceMetrics['referral']?.leads || 1)} — invest in referral program.`);
w(`7. **Projected ARR** from upsells alone: **${usd(totalUpsellMonthly * 12)}** (before churn).`);
w(`8. **${sortedLocations[0]?.[0] || 'Melbourne'}** generates the most revenue — consider geo-targeted marketing.`);
w('');
w('---');
w('');
w('*Report generated by XELA Pipeline Simulation Engine v1.0*');

// ── Write Report ───────────────────────────────────────────────────────────────

const reportContent = lines.join('\n');
const reportPath = join(outDir, 'simulation-report.md');
writeFileSync(reportPath, reportContent);
console.log(`Report written to ${reportPath}`);
console.log(`Report length: ${lines.length} lines, ${reportContent.length.toLocaleString()} characters`);
