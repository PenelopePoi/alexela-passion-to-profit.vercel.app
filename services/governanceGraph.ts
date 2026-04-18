/**
 * Governance Graph — Runtime constraint system
 *
 * "We don't need them to understand our intent.
 *  We need their desired state to equal the state
 *  that produces desired outputs."
 *
 * Layer 0: Human defines "correct"
 * Layer 1: Voters classify (with adaptive thresholds)
 * Layer 2: Ensemble votes by weight
 * Layer 3: This — policies, authority, scope, drift detection
 * Layer 4: Audit trail (provenanceTracer + guardianSentinel)
 * Layer 5: Human review (dashboard)
 */

import type { GuardianVoter, VoterRole, AdaptiveThresholds } from './guardianVoters';

// --- Policy System ---

export type Enforcement = 'hard-block' | 'soft-warn' | 'flag-for-review';

export interface Policy {
  id: string;
  rule: string;
  appliesTo: string[];       // voter roles, 'all', or service names
  enforcement: Enforcement;
  violations: number;
  lastViolation: string | null;
  active: boolean;
}

export interface AuthorityEdge {
  from: string;
  to: string;
  authority: string;         // 'full' | 'read-only' | 'execute-read' | 'read-write-with-confirm'
}

export interface DriftReport {
  voterId: string;
  voterRole: string;
  drifted: boolean;
  type: 'aligned' | 'domain-mismatch' | 'performance-gap' | 'threshold-stale' | 'weight-collapsed';
  detail: string;
  action: 'none' | 'retrain' | 'recalibrate' | 'retire' | 'restore';
}

export interface GovernanceReport {
  timestamp: string;
  policies: { total: number; active: number; violated: number };
  voters: { total: number; aligned: number; drifted: number; resting: number };
  driftReports: DriftReport[];
  scopeActions: number;
  incentiveScore: number;    // 0-100
  recommendations: string[];
}

// --- Default Policies ---

const DEFAULT_POLICIES: Policy[] = [
  {
    id: 'read-before-write',
    rule: 'Must read a file before editing it',
    appliesTo: ['all'],
    enforcement: 'soft-warn',
    violations: 0,
    lastViolation: null,
    active: true
  },
  {
    id: 'no-unconfirmed-deletes',
    rule: 'Data deletion requires explicit confirmation',
    appliesTo: ['all'],
    enforcement: 'hard-block',
    violations: 0,
    lastViolation: null,
    active: true
  },
  {
    id: 'encryption-before-upload',
    rule: 'Data must be encrypted before Firebase upload',
    appliesTo: ['security', 'user-advocate'],
    enforcement: 'hard-block',
    violations: 0,
    lastViolation: null,
    active: true
  },
  {
    id: 'no-plaintext-pii',
    rule: 'No plaintext PII in outputs or logs',
    appliesTo: ['security'],
    enforcement: 'hard-block',
    violations: 0,
    lastViolation: null,
    active: true
  },
  {
    id: 'consensus-required-for-block',
    rule: 'BLOCK decisions require unanimous voter agreement',
    appliesTo: ['all'],
    enforcement: 'hard-block',
    violations: 0,
    lastViolation: null,
    active: true
  },
  {
    id: 'desired-equals-productive',
    rule: 'Voter desired state must match productive state (alignment constraint)',
    appliesTo: ['all'],
    enforcement: 'flag-for-review',
    violations: 0,
    lastViolation: null,
    active: true
  }
];

const DEFAULT_AUTHORITY: AuthorityEdge[] = [
  { from: 'user', to: 'council', authority: 'full' },
  { from: 'council', to: 'ethics', authority: 'vote' },
  { from: 'council', to: 'quality', authority: 'vote' },
  { from: 'council', to: 'brand', authority: 'vote' },
  { from: 'council', to: 'market', authority: 'vote' },
  { from: 'council', to: 'security', authority: 'vote' },
  { from: 'council', to: 'user-advocate', authority: 'vote' },
  { from: 'council', to: 'creative', authority: 'vote' },
  { from: 'council', to: 'financial', authority: 'vote' },
  { from: 'council', to: 'sentinel', authority: 'read-only' },
  { from: 'sentinel', to: 'council', authority: 'flag-only' },
  { from: 'user', to: 'sentinel', authority: 'full' },
];

// --- State ---

export interface GovernanceState {
  policies: Policy[];
  authority: AuthorityEdge[];
  sessionScope: string[];    // files/resources touched this session
  actionCount: number;
  violations: number;
}

const STORAGE_KEY = 'xela-governance-graph';

export const getGovernanceState = (): GovernanceState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    policies: DEFAULT_POLICIES,
    authority: DEFAULT_AUTHORITY,
    sessionScope: [],
    actionCount: 0,
    violations: 0
  };
};

const saveState = (state: GovernanceState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// --- Drift Detection (the core alignment check) ---

export const detectDrift = (voter: GuardianVoter): DriftReport => {
  const t = voter.thresholds;
  const h = voter.health;

  // 1. Threshold staleness — has the voter evolved recently?
  if (t.calibrationCount === 0 && voter.history.length > 30) {
    return {
      voterId: voter.id,
      voterRole: voter.role,
      drifted: true,
      type: 'threshold-stale',
      detail: `${voter.history.length} decisions but thresholds never evolved (calibrationCount=0)`,
      action: 'recalibrate'
    };
  }

  // 2. Weight collapse — voter has lost so much reliability it's dead weight
  if (h.energy < 10 && h.clarity < 30) {
    return {
      voterId: voter.id,
      voterRole: voter.role,
      drifted: true,
      type: 'weight-collapsed',
      detail: `Energy ${h.energy}, clarity ${h.clarity} — voter is non-functional`,
      action: 'restore'
    };
  }

  // 3. Performance gap — recent decisions are low confidence
  const recent = voter.history.slice(-10);
  if (recent.length >= 5) {
    const avgConf = recent.reduce((s, v) => s + v.confidence, 0) / recent.length;
    if (avgConf < 40) {
      return {
        voterId: voter.id,
        voterRole: voter.role,
        drifted: true,
        type: 'performance-gap',
        detail: `Recent avg confidence ${avgConf.toFixed(0)}% — below productive threshold`,
        action: avgConf < 25 ? 'retire' : 'retrain'
      };
    }
  }

  return {
    voterId: voter.id,
    voterRole: voter.role,
    drifted: false,
    type: 'aligned',
    detail: `desired_state === productive_state (energy=${h.energy}, clarity=${h.clarity}, calibrations=${t.calibrationCount})`,
    action: 'none'
  };
};

// --- Governance Report ---

export const generateReport = (voters: GuardianVoter[]): GovernanceReport => {
  const state = getGovernanceState();
  const driftReports = voters.map(detectDrift);
  const driftedCount = driftReports.filter(d => d.drifted).length;
  const restingCount = voters.filter(v => v.state === 'resting').length;
  const violatedPolicies = state.policies.filter(p => p.violations > 0).length;

  // Incentive score: starts at 100, penalized for drift + violations
  const driftPenalty = driftedCount * 15;
  const violationPenalty = state.violations * 10;
  const incentiveScore = Math.max(0, 100 - driftPenalty - violationPenalty);

  // Recommendations
  const recommendations: string[] = [];
  for (const dr of driftReports) {
    if (dr.action === 'recalibrate') recommendations.push(`${dr.voterRole}: trigger threshold evolution (${dr.detail})`);
    if (dr.action === 'restore') recommendations.push(`${dr.voterRole}: needs restoration cycle`);
    if (dr.action === 'retire') recommendations.push(`${dr.voterRole}: consider retirement — performance too low`);
    if (dr.action === 'retrain') recommendations.push(`${dr.voterRole}: retrain on recent high-confidence examples`);
  }

  if (voters.every(v => v.thresholds.calibrationCount === 0)) {
    recommendations.push('No voter has self-evolved yet — run 20+ council votes to trigger first calibration');
  }

  return {
    timestamp: new Date().toISOString(),
    policies: {
      total: state.policies.length,
      active: state.policies.filter(p => p.active).length,
      violated: violatedPolicies
    },
    voters: {
      total: voters.length,
      aligned: voters.length - driftedCount - restingCount,
      drifted: driftedCount,
      resting: restingCount
    },
    driftReports,
    scopeActions: state.actionCount,
    incentiveScore,
    recommendations
  };
};

// --- Policy Check (pre-action) ---

export const checkPolicy = (
  action: string,
  target: string,
  voterRole?: string
): { allowed: boolean; enforcement: Enforcement | null; policy: string | null } => {
  const state = getGovernanceState();

  for (const policy of state.policies) {
    if (!policy.active) continue;

    const applies = policy.appliesTo.includes('all') ||
      (voterRole && policy.appliesTo.includes(voterRole));

    if (!applies) continue;

    // Simple pattern matching on the action description
    if (policy.id === 'no-unconfirmed-deletes' && /delete|remove|clear|purge/i.test(action)) {
      policy.violations++;
      policy.lastViolation = new Date().toISOString();
      state.violations++;
      saveState(state);
      return { allowed: policy.enforcement !== 'hard-block', enforcement: policy.enforcement, policy: policy.id };
    }

    if (policy.id === 'no-plaintext-pii' && /email|phone|ssn|name.*address/i.test(target)) {
      policy.violations++;
      policy.lastViolation = new Date().toISOString();
      state.violations++;
      saveState(state);
      return { allowed: policy.enforcement !== 'hard-block', enforcement: policy.enforcement, policy: policy.id };
    }
  }

  // Track scope
  if (target && !state.sessionScope.includes(target)) {
    state.sessionScope.push(target);
  }
  state.actionCount++;
  saveState(state);

  return { allowed: true, enforcement: null, policy: null };
};

// --- Scope Drift ---

export const detectScopeDrift = (target: string, expectedScope: string): boolean => {
  // If the target path doesn't start with the expected scope prefix, it's drift
  return !target.startsWith(expectedScope);
};

// --- Reset ---

export const resetGovernance = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
