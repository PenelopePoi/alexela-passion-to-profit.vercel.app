/**
 * XELA Elite AI Creative Studio — Pipeline Simulator
 * Simulates 20,000 clients through the full branding pipeline
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Personality {
  decisiveness: number;
  pickiness: number;
  budget_sensitivity: number;
  design_literacy: number;
}

interface Preferences {
  color_warmth: number;
  font_style: string;
  tone: string;
  complexity: string;
}

interface SyntheticClient {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  location: string;
  vibe: string;
  budget: string;
  services: string[];
  yearsExperience: string;
  referralSource: string;
  personality: Personality;
  preferences: Preferences;
}

interface StageResult {
  stage: string;
  passed: boolean;
  details: Record<string, any>;
}

interface PipelineResult {
  clientId: string;
  industry: string;
  budget: string;
  location: string;
  referralSource: string;
  stages: StageResult[];
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

// ── Preference Model (learns over time) ────────────────────────────────────────

interface IndustryPreferenceModel {
  avgWarmth: number;
  preferredFont: Record<string, number>;
  preferredTone: Record<string, number>;
  preferredComplexity: Record<string, number>;
  preferredVibe: Record<string, number>;
  sampleCount: number;
}

class PreferenceEngine {
  models: Record<string, IndustryPreferenceModel> = {};

  getModel(industry: string): IndustryPreferenceModel {
    if (!this.models[industry]) {
      this.models[industry] = {
        avgWarmth: 0,
        preferredFont: {},
        preferredTone: {},
        preferredComplexity: {},
        preferredVibe: {},
        sampleCount: 0,
      };
    }
    return this.models[industry];
  }

  learn(client: SyntheticClient, satisfaction: number): void {
    const m = this.getModel(client.industry);
    const w = satisfaction / 10; // weight by satisfaction
    const n = m.sampleCount;

    // Running average for warmth
    m.avgWarmth = (m.avgWarmth * n + client.preferences.color_warmth * w) / (n + 1);

    // Accumulate weighted votes
    const font = client.preferences.font_style;
    m.preferredFont[font] = (m.preferredFont[font] || 0) + w;

    const tone = client.preferences.tone;
    m.preferredTone[tone] = (m.preferredTone[tone] || 0) + w;

    const complexity = client.preferences.complexity;
    m.preferredComplexity[complexity] = (m.preferredComplexity[complexity] || 0) + w;

    const vibe = client.vibe;
    m.preferredVibe[vibe] = (m.preferredVibe[vibe] || 0) + w;

    m.sampleCount++;
  }

  /**
   * How well does the model predict this client's preferences?
   * Returns 0–1, higher = better alignment (= fewer revisions needed)
   */
  alignmentScore(client: SyntheticClient): number {
    const m = this.getModel(client.industry);
    if (m.sampleCount < 3) return 0.2; // cold start — poor alignment

    let score = 0;

    // Warmth alignment
    const warmthDelta = Math.abs(m.avgWarmth - client.preferences.color_warmth);
    score += (1 - warmthDelta) * 0.25;

    // Font alignment
    const topFont = topKey(m.preferredFont);
    score += (topFont === client.preferences.font_style ? 1 : 0.3) * 0.2;

    // Tone alignment
    const topTone = topKey(m.preferredTone);
    score += (topTone === client.preferences.tone ? 1 : 0.3) * 0.2;

    // Complexity alignment
    const topComplexity = topKey(m.preferredComplexity);
    score += (topComplexity === client.preferences.complexity ? 1 : 0.3) * 0.15;

    // Vibe alignment
    const topVibe = topKey(m.preferredVibe);
    score += (topVibe === client.vibe ? 1 : 0.3) * 0.2;

    // Learning curve bonus: more samples = tighter predictions
    const experienceBonus = Math.min(m.sampleCount / 200, 0.3); // cap at +0.3
    score = Math.min(score + experienceBonus, 1.0);

    return score;
  }

  snapshot(): Record<string, IndustryPreferenceModel> {
    return JSON.parse(JSON.stringify(this.models));
  }
}

function topKey(obj: Record<string, number>): string | null {
  let best: string | null = null;
  let bestVal = -Infinity;
  for (const [k, v] of Object.entries(obj)) {
    if (v > bestVal) { bestVal = v; best = k; }
  }
  return best;
}

// ── Deterministic Random ───────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const rand = seededRandom(7777);

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ── Pricing ────────────────────────────────────────────────────────────────────

const PACKAGE_PRICES: Record<string, number> = {
  starter: 149,
  growth: 349,
  elite: 749,
};

const UPSELL_PRICES: Record<string, number> = {
  seo_monthly: 199,
  gbp_setup: 99,
  social_templates: 149,
  business_cards: 79,
};

// ── Pipeline Stages ────────────────────────────────────────────────────────────

function simulateDiscovery(client: SyntheticClient): StageResult {
  // Discovery → contact probability depends on referral source
  const contactRates: Record<string, number> = {
    google: 0.35,
    social: 0.38,
    referral: 0.55,
    flyer: 0.30,
    doorhanger: 0.28,
    phone: 0.50,
  };
  const rate = contactRates[client.referralSource] || 0.35;
  const contacted = rand() < rate;
  const daysToContact = contacted ? Math.floor(rand() * 14) + 1 : 0;

  return {
    stage: 'discovery',
    passed: contacted,
    details: { referralSource: client.referralSource, contactRate: rate, daysToContact },
  };
}

function simulateIntake(client: SyntheticClient): StageResult {
  // Form completion depends on design_literacy and decisiveness
  const baseRate = 0.80;
  const literacyBonus = (client.personality.design_literacy - 5) * 0.02;
  const decisivenessBonus = (client.personality.decisiveness - 5) * 0.015;
  const completionRate = clamp(baseRate + literacyBonus + decisivenessBonus, 0.55, 0.95);
  const completed = rand() < completionRate;
  const timeMinutes = completed ? Math.floor(rand() * 20) + 5 : 0;

  return {
    stage: 'intake',
    passed: completed,
    details: { completionRate, timeMinutes, formAbandoned: !completed },
  };
}

function simulateConsultation(client: SyntheticClient): StageResult {
  // Package selection based on budget tier
  let packageSelected: string;
  if (client.budget === 'elite') {
    packageSelected = rand() < 0.75 ? 'elite' : 'growth';
  } else if (client.budget === 'premium') {
    packageSelected = rand() < 0.6 ? 'growth' : (rand() < 0.5 ? 'elite' : 'starter');
  } else {
    packageSelected = rand() < 0.7 ? 'starter' : 'growth';
  }

  // Upsell probability
  const upsellBase = client.budget === 'elite' ? 0.5 : client.budget === 'premium' ? 0.3 : 0.1;
  const literacyBoost = (client.personality.design_literacy - 5) * 0.02;
  const upsellProb = clamp(upsellBase + literacyBoost, 0.05, 0.7);
  const upsellOffered = true;
  const upsellAccepted = rand() < upsellProb;

  // Consultation drop-off (price shock)
  const priceSensitivity = client.personality.budget_sensitivity / 10;
  const price = PACKAGE_PRICES[packageSelected];
  const shockProb = priceSensitivity * 0.15;
  const droppedOff = rand() < shockProb;

  return {
    stage: 'consultation',
    passed: !droppedOff,
    details: { packageSelected, upsellOffered, upsellAccepted, price, priceShockProb: shockProb },
  };
}

function simulateBrandGeneration(
  client: SyntheticClient,
  prefEngine: PreferenceEngine,
  packageSelected: string,
): StageResult {
  const alignment = prefEngine.alignmentScore(client);

  // Base revisions: inverse of alignment, scaled by pickiness
  const baseRevisions = Math.round((1 - alignment) * 5 + 1);
  const pickinessAdjust = Math.round((client.personality.pickiness - 5) * 0.5);
  const literacyAdjust = Math.round((client.personality.design_literacy - 5) * -0.3);
  const revisions = clamp(baseRevisions + pickinessAdjust + literacyAdjust, 1, 12);

  // Time per revision in hours (elite gets faster turnaround)
  const hoursPerRevision = packageSelected === 'elite' ? 2 : packageSelected === 'growth' ? 6 : 12;
  const totalHours = revisions * hoursPerRevision;

  // Elements that needed revision
  const elements: string[] = [];
  if (rand() < (1 - alignment) * 0.8) elements.push('color_palette');
  if (rand() < (1 - alignment) * 0.7) elements.push('typography');
  if (rand() < (1 - alignment) * 0.6) elements.push('logo_mark');
  if (rand() < (1 - alignment) * 0.5) elements.push('tagline');
  if (rand() < (1 - alignment) * 0.4) elements.push('layout');
  if (elements.length === 0) elements.push('minor_tweaks');

  // Final output alignment score (improves with revisions)
  const outputAlignment = clamp(alignment + revisions * 0.08, 0.5, 1.0);

  return {
    stage: 'brand_generation',
    passed: true,
    details: {
      alignment,
      revisions,
      hoursPerRevision,
      totalHours,
      elementsRevised: elements,
      outputAlignment,
    },
  };
}

function simulateDelivery(
  client: SyntheticClient,
  outputAlignment: number,
  revisions: number,
  packageSelected: string,
): StageResult {
  // Satisfaction = f(alignment, revisions, budget match)
  const alignmentScore = outputAlignment * 6;
  const revisionPenalty = Math.max(0, (revisions - 2) * 0.3);
  const budgetMatch = (
    (client.budget === 'elite' && packageSelected === 'elite') ||
    (client.budget === 'premium' && packageSelected === 'growth') ||
    (client.budget === 'budget' && packageSelected === 'starter')
  ) ? 1.5 : 0;

  const satisfaction = clamp(
    Math.round((alignmentScore - revisionPenalty + budgetMatch + rand() * 2) * 10) / 10,
    1, 10,
  );

  // NPS: satisfaction mapped to -100..100 range
  const nps = satisfaction >= 9 ? 10 : satisfaction >= 7 ? Math.round(rand() * 4 + 5) : Math.round(satisfaction - 4);

  // Review likelihood
  const reviewProb = satisfaction >= 8 ? 0.4 : satisfaction >= 6 ? 0.15 : 0.05;
  const willReview = rand() < reviewProb;

  return {
    stage: 'delivery',
    passed: true,
    details: { satisfaction, nps, willReview, reviewProb },
  };
}

function simulatePostDelivery(
  client: SyntheticClient,
  satisfaction: number,
  nps: number,
): StageResult {
  // SEO/GBP upsell
  const upsellBase = satisfaction >= 8 ? 0.35 : satisfaction >= 6 ? 0.15 : 0.05;
  const budgetFactor = client.budget === 'elite' ? 1.5 : client.budget === 'premium' ? 1.0 : 0.5;
  const upsellProb = clamp(upsellBase * budgetFactor, 0, 0.6);
  const upsellAccepted = rand() < upsellProb;

  // Referral
  const referralBase = nps >= 9 ? 0.45 : nps >= 7 ? 0.2 : 0.05;
  const referralGenerated = rand() < referralBase;

  // Repeat purchase (within 12 months)
  const repeatBase = satisfaction >= 8 ? 0.25 : satisfaction >= 6 ? 0.1 : 0.03;
  const repeatPurchase = rand() < repeatBase;

  // Monthly upsell revenue
  let monthlyUpsell = 0;
  if (upsellAccepted) {
    monthlyUpsell += UPSELL_PRICES.seo_monthly;
    if (rand() < 0.4) monthlyUpsell += UPSELL_PRICES.gbp_setup;
    if (rand() < 0.3) monthlyUpsell += UPSELL_PRICES.social_templates;
  }

  return {
    stage: 'post_delivery',
    passed: true,
    details: { upsellAccepted, upsellProb, referralGenerated, repeatPurchase, monthlyUpsell },
  };
}

// ── Main Pipeline ──────────────────────────────────────────────────────────────

function runPipeline(clients: SyntheticClient[]): {
  results: PipelineResult[];
  preferenceSnapshots: { clientIndex: number; snapshot: Record<string, IndustryPreferenceModel> }[];
} {
  const prefEngine = new PreferenceEngine();
  const results: PipelineResult[] = [];
  const preferenceSnapshots: { clientIndex: number; snapshot: Record<string, IndustryPreferenceModel> }[] = [];

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const stages: StageResult[] = [];
    let reachedStage = 0;
    let finalSatisfaction: number | null = null;
    let npsScore: number | null = null;
    let revisionCount: number | null = null;
    let timeToApproval: number | null = null;
    let packageSelected: string | null = null;
    let upsellAccepted = false;
    let referralGenerated = false;
    let repeatPurchase = false;
    let revenue = 0;
    let upsellRevenue = 0;

    // Stage 1: Discovery
    const discovery = simulateDiscovery(client);
    stages.push(discovery);
    if (!discovery.passed) {
      results.push({
        clientId: client.id, industry: client.industry, budget: client.budget,
        location: client.location, referralSource: client.referralSource,
        stages, reachedStage: 1,
        finalSatisfaction, npsScore, revisionCount, timeToApproval,
        packageSelected, upsellAccepted, referralGenerated, repeatPurchase,
        revenue, upsellRevenue,
      });
      continue;
    }
    reachedStage = 1;

    // Stage 2: Intake
    const intake = simulateIntake(client);
    stages.push(intake);
    if (!intake.passed) {
      results.push({
        clientId: client.id, industry: client.industry, budget: client.budget,
        location: client.location, referralSource: client.referralSource,
        stages, reachedStage: 2,
        finalSatisfaction, npsScore, revisionCount, timeToApproval,
        packageSelected, upsellAccepted, referralGenerated, repeatPurchase,
        revenue, upsellRevenue,
      });
      continue;
    }
    reachedStage = 2;

    // Stage 3: Consultation
    const consultation = simulateConsultation(client);
    stages.push(consultation);
    packageSelected = consultation.details.packageSelected;
    if (!consultation.passed) {
      results.push({
        clientId: client.id, industry: client.industry, budget: client.budget,
        location: client.location, referralSource: client.referralSource,
        stages, reachedStage: 3,
        finalSatisfaction, npsScore, revisionCount, timeToApproval,
        packageSelected, upsellAccepted, referralGenerated, repeatPurchase,
        revenue, upsellRevenue,
      });
      continue;
    }
    reachedStage = 3;

    // Stage 4: Brand Generation
    const brandGen = simulateBrandGeneration(client, prefEngine, packageSelected);
    stages.push(brandGen);
    revisionCount = brandGen.details.revisions;
    timeToApproval = brandGen.details.totalHours;
    reachedStage = 4;

    // Stage 5: Delivery
    const delivery = simulateDelivery(
      client, brandGen.details.outputAlignment, revisionCount, packageSelected,
    );
    stages.push(delivery);
    finalSatisfaction = delivery.details.satisfaction;
    npsScore = delivery.details.nps;
    revenue = PACKAGE_PRICES[packageSelected] || 0;
    reachedStage = 5;

    // Teach the preference engine from this client
    prefEngine.learn(client, finalSatisfaction);

    // Stage 6: Post-Delivery
    const postDelivery = simulatePostDelivery(client, finalSatisfaction, npsScore);
    stages.push(postDelivery);
    upsellAccepted = postDelivery.details.upsellAccepted;
    referralGenerated = postDelivery.details.referralGenerated;
    repeatPurchase = postDelivery.details.repeatPurchase;
    upsellRevenue = postDelivery.details.monthlyUpsell;
    reachedStage = 6;

    results.push({
      clientId: client.id, industry: client.industry, budget: client.budget,
      location: client.location, referralSource: client.referralSource,
      stages, reachedStage,
      finalSatisfaction, npsScore, revisionCount, timeToApproval,
      packageSelected, upsellAccepted, referralGenerated, repeatPurchase,
      revenue, upsellRevenue,
    });

    // Snapshot preference model every 1000 clients
    if ((i + 1) % 1000 === 0) {
      preferenceSnapshots.push({ clientIndex: i + 1, snapshot: prefEngine.snapshot() });
      console.log(`  Processed ${(i + 1).toLocaleString()} clients | ` +
        `Last 100 avg revisions: ${avgRevisions(results, Math.max(0, results.length - 100), results.length).toFixed(1)} | ` +
        `avg satisfaction: ${avgSatisfaction(results, Math.max(0, results.length - 100), results.length).toFixed(1)}`);
    }
  }

  return { results, preferenceSnapshots };
}

function avgRevisions(results: PipelineResult[], from: number, to: number): number {
  let sum = 0, count = 0;
  for (let i = from; i < to; i++) {
    if (results[i].revisionCount !== null) {
      sum += results[i].revisionCount!;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

function avgSatisfaction(results: PipelineResult[], from: number, to: number): number {
  let sum = 0, count = 0;
  for (let i = from; i < to; i++) {
    if (results[i].finalSatisfaction !== null) {
      sum += results[i].finalSatisfaction!;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

// ── Execute ────────────────────────────────────────────────────────────────────

const outDir = join(import.meta.dirname!, '..', '..', 'output', 'simulation');
mkdirSync(outDir, { recursive: true });

const clientsPath = join(outDir, 'synthetic-clients.json');
console.log('Loading synthetic clients...');
const clients: SyntheticClient[] = JSON.parse(readFileSync(clientsPath, 'utf-8'));
console.log(`Loaded ${clients.length.toLocaleString()} clients\n`);

console.log('Running pipeline simulation...\n');
const { results, preferenceSnapshots } = runPipeline(clients);

// Save results
const resultsPath = join(outDir, 'pipeline-results.json');
writeFileSync(resultsPath, JSON.stringify(results, null, 2));
console.log(`\nWrote pipeline results to ${resultsPath}`);

const snapshotsPath = join(outDir, 'preference-snapshots.json');
writeFileSync(snapshotsPath, JSON.stringify(preferenceSnapshots, null, 2));
console.log(`Wrote preference snapshots to ${snapshotsPath}`);

// Quick funnel summary
const funnelCounts = [0, 0, 0, 0, 0, 0, 0]; // total, discovery, intake, consult, brand, deliver, post
for (const r of results) {
  funnelCounts[0]++;
  if (r.reachedStage >= 1) funnelCounts[1]++;
  if (r.reachedStage >= 2) funnelCounts[2]++;
  if (r.reachedStage >= 3) funnelCounts[3]++;
  if (r.reachedStage >= 4) funnelCounts[4]++;
  if (r.reachedStage >= 5) funnelCounts[5]++;
  if (r.reachedStage >= 6) funnelCounts[6]++;
}

console.log('\nFunnel Summary:');
const labels = ['Total Leads', 'Made Contact', 'Completed Intake', 'Post-Consultation', 'Brand Generated', 'Delivered', 'Post-Delivery'];
for (let i = 0; i < labels.length; i++) {
  console.log(`  ${labels[i]}: ${funnelCounts[i].toLocaleString()} (${((funnelCounts[i] / funnelCounts[0]) * 100).toFixed(1)}%)`);
}
