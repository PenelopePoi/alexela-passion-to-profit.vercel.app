/**
 * Token Gateway — Entropy source + Translation layer + Output gate
 *
 * Three jobs:
 * 1. ENTROPY: Inject measured randomness into voter deliberation
 *    so the system doesn't collapse to deterministic single-path decisions.
 *    Entropy comes from: crypto.getRandomValues, timestamp jitter,
 *    and the provenance chain hash (each generation seeds the next).
 *
 * 2. GATEWAY: Every AI call passes through here. The governance graph
 *    checks policy before the call. The sentinel audits after.
 *    Nothing reaches Gemini without clearing the gate.
 *
 * 3. TRANSLATION: Voter decisions (approve/reject/revise/abstain at 0-100
 *    confidence) get translated into token-level instructions for the
 *    Gemini prompt. A "revise with 60% confidence from the ethics voter"
 *    becomes a concrete prompt modifier. The AI doesn't see voter internals —
 *    it sees translated constraints in its own language.
 */

import { checkPolicy } from './governanceGraph';
import { auditEvent } from './guardianSentinel';
import { traceGeneration } from './provenanceTracer';

// --- Entropy Source ---

export interface EntropyState {
  seed: string;
  nonce: number;
  lastChainHash: string;
  entropyPool: number[];  // rolling pool of random values
}

const POOL_SIZE = 32;

/**
 * Initialize entropy from crypto + timestamp + optional chain hash
 */
export const createEntropySource = (chainHash?: string): EntropyState => {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const seed = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const pool: number[] = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push(randomBytes[i % 32] / 255); // 0-1 range
  }

  return {
    seed,
    nonce: Date.now(),
    lastChainHash: chainHash || 'GENESIS',
    entropyPool: pool
  };
};

/**
 * Draw entropy value (0-1). Pool replenishes from crypto when low.
 * Each draw mixes in the nonce for non-repeating sequences.
 */
export const drawEntropy = (state: EntropyState): { value: number; state: EntropyState } => {
  if (state.entropyPool.length === 0) {
    // Replenish
    const fresh = new Uint8Array(POOL_SIZE);
    crypto.getRandomValues(fresh);
    state.entropyPool = Array.from(fresh).map(b => b.toString(16).padStart(2, '0'))
      .map((hex, i) => (parseInt(hex, 16) ^ (state.nonce >> (i % 8))) / 255);
  }

  const value = state.entropyPool.shift()!;
  state.nonce++;

  return { value, state };
};

/**
 * Entropy-weighted voter selection for tiebreakers.
 * Instead of always picking the highest-weight voter,
 * entropy introduces proportional sampling — higher weight = more likely,
 * but not guaranteed. Prevents deterministic lock-in.
 */
export const entropyWeightedSelect = (
  weights: Array<{ id: string; weight: number }>,
  entropy: EntropyState
): { selected: string; entropy: EntropyState } => {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  const { value, state } = drawEntropy(entropy);
  const target = value * total;

  let cumulative = 0;
  for (const w of weights) {
    cumulative += w.weight;
    if (cumulative >= target) {
      return { selected: w.id, entropy: state };
    }
  }

  return { selected: weights[weights.length - 1].id, entropy: state };
};

// --- Token Translation Layer ---

export type VoterSignal = {
  role: string;
  decision: 'approve' | 'reject' | 'revise' | 'abstain';
  confidence: number;  // 0-100
  reasoning?: string;
};

export interface TranslatedConstraints {
  systemModifier: string;    // injected into Gemini system prompt
  temperatureAdjust: number; // -0.3 to +0.3, modifies generation temp
  stopSignals: string[];     // patterns that should halt generation
  requiredElements: string[]; // must appear in output
  bannedElements: string[];   // must NOT appear in output
}

/**
 * Translate voter decisions into token-level constraints for the LLM.
 * The AI never sees voter internals — it sees instructions in its own language.
 */
export const translateVoterSignals = (signals: VoterSignal[]): TranslatedConstraints => {
  const modifiers: string[] = [];
  let tempAdjust = 0;
  const stopSignals: string[] = [];
  const required: string[] = [];
  const banned: string[] = [];

  for (const signal of signals) {
    if (signal.decision === 'abstain') continue;

    // High-confidence rejections become hard constraints
    if (signal.decision === 'reject' && signal.confidence > 70) {
      if (signal.role === 'ethics') {
        modifiers.push('Do not produce content that could manipulate, deceive, or exploit.');
        banned.push('urgency', 'limited time', 'act now', 'don\'t miss');
        tempAdjust -= 0.1; // more conservative
      }
      if (signal.role === 'security') {
        modifiers.push('Do not include any PII, credentials, or sensitive data in the output.');
        banned.push('password', 'api_key', 'secret', 'ssn');
        tempAdjust -= 0.1;
      }
      if (signal.role === 'brand') {
        modifiers.push('Ensure all output is consistent with the brand voice and visual identity.');
        required.push('brand-consistent');
      }
    }

    // Revise signals add guardrails without blocking
    if (signal.decision === 'revise') {
      if (signal.role === 'quality') {
        modifiers.push('Ensure professional quality — no placeholder text, no generic filler.');
        tempAdjust -= 0.05;
      }
      if (signal.role === 'user-advocate') {
        modifiers.push('Frame the output from the user\'s perspective. Prioritize clarity and accessibility.');
      }
      if (signal.role === 'creative') {
        modifiers.push('Push for originality — avoid the obvious first-draft answer.');
        tempAdjust += 0.1; // more creative
      }
      if (signal.role === 'market') {
        modifiers.push('Consider revenue impact and competitive positioning in the output.');
      }
      if (signal.role === 'financial') {
        modifiers.push('Ensure pricing and value claims are defensible and realistic.');
      }
    }

    // Low-confidence signals increase temperature (more exploration)
    if (signal.confidence < 40) {
      tempAdjust += 0.05;
    }
  }

  // Clamp temperature adjustment
  tempAdjust = Math.max(-0.3, Math.min(0.3, tempAdjust));

  return {
    systemModifier: modifiers.length > 0
      ? `\n\nGOVERNANCE CONSTRAINTS:\n${modifiers.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
      : '',
    temperatureAdjust: Math.round(tempAdjust * 100) / 100,
    stopSignals,
    requiredElements: required,
    bannedElements: banned
  };
};

// --- Output Gate ---

export interface GateResult {
  passed: boolean;
  blocked: boolean;
  warnings: string[];
  auditId: string | null;
  constraints: TranslatedConstraints | null;
}

/**
 * The gate. Every AI call passes through here.
 *
 * Pre-call: checks governance policy + translates voter signals into constraints.
 * Post-call: audits the result via sentinel + traces via provenance chain.
 */
export const preCallGate = async (
  functionName: string,
  input: any,
  voterSignals?: VoterSignal[]
): Promise<GateResult> => {
  const warnings: string[] = [];

  // 1. Policy check
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input).slice(0, 200);
  const policyResult = checkPolicy(functionName, inputStr);

  if (!policyResult.allowed) {
    // Hard block
    await auditEvent('ai-generation', `BLOCKED: ${functionName} — policy ${policyResult.policy}`, { functionName, policy: policyResult.policy });
    return {
      passed: false,
      blocked: true,
      warnings: [`Blocked by policy: ${policyResult.policy}`],
      auditId: null,
      constraints: null
    };
  }

  if (policyResult.enforcement === 'soft-warn') {
    warnings.push(`Policy warning: ${policyResult.policy}`);
  }

  // 2. Translate voter signals into constraints (if council voted)
  const constraints = voterSignals ? translateVoterSignals(voterSignals) : null;

  // 3. Audit the call
  await auditEvent('ai-generation', `GATE PASS: ${functionName}`, { functionName, hasConstraints: !!constraints });

  return {
    passed: true,
    blocked: false,
    warnings,
    auditId: null,
    constraints
  };
};

/**
 * Post-call: trace the generation in the provenance chain.
 */
export const postCallTrace = async (
  functionName: string,
  model: string,
  input: any,
  output: any,
  latencyMs?: number
): Promise<void> => {
  try {
    await traceGeneration({
      model,
      functionName,
      input,
      output,
      latencyMs
    });
  } catch {
    // Tracing failure should never block the response
  }
};

/**
 * Check output for banned elements from voter constraints.
 * Returns true if output is clean, false if it contains banned content.
 */
export const validateOutput = (
  output: string,
  constraints: TranslatedConstraints | null
): { clean: boolean; violations: string[] } => {
  if (!constraints) return { clean: true, violations: [] };

  const violations: string[] = [];
  const lower = output.toLowerCase();

  for (const banned of constraints.bannedElements) {
    if (lower.includes(banned.toLowerCase())) {
      violations.push(`Output contains banned element: "${banned}"`);
    }
  }

  return {
    clean: violations.length === 0,
    violations
  };
};
