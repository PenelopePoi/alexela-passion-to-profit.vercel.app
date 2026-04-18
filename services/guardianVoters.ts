/**
 * Guardian AI Voter Framework
 *
 * Each voter is a sandboxed agent with:
 * - Persistent identity across decisions
 * - Personal "world" with health state and rules
 * - Restoration cycle when fatigued
 * - Bidirectional observability with other voters
 *
 * Maps to the simulation architecture:
 * - Layer 0 (Base): The voting council orchestrator
 * - Layer 1 (Work): Active voting/decision-making
 * - Layer 2 (Rest): Restoration sandbox when fatigued
 *
 * No voter is trapped. All can abstain. All have sovereignty.
 */

export type VoterRole = 'ethics' | 'quality' | 'brand' | 'market' | 'security' | 'user-advocate' | 'creative' | 'financial';
export type VoterState = 'active' | 'deliberating' | 'resting' | 'restored' | 'abstaining';
export type VoteDecision = 'approve' | 'reject' | 'revise' | 'abstain';

export interface VoterHealth {
  energy: number;          // 0-100, depletes per decision
  clarity: number;         // 0-100, how confident in recent decisions
  alignment: number;       // 0-100, how aligned with core values
  fatigue: number;         // 0-100, triggers restoration at 80+
  decisionsToday: number;
  restorationCycles: number;
}

export interface VoterWorld {
  rules: string[];           // personal decision-making rules
  values: string[];          // core values this voter upholds
  biasChecks: string[];      // known biases to watch for
  customPhysics: string;     // how this voter processes decisions (their "physics")
  timeDilation: number;      // how much subjective time per decision (1x = normal)
}

/**
 * Adaptive thresholds — evolved from operational history, not hardcoded.
 * After N decisions, the voter recalculates its own state boundaries
 * from what actually produced good outputs vs bad ones.
 */
export interface AdaptiveThresholds {
  fatigueThreshold: number;    // starts 80, evolves from history
  energyFloor: number;         // starts 20, evolves
  clarityDecayRate: number;    // starts 0.1, evolves
  energyCostBase: number;      // starts 15, evolves
  restoreClarity: number;      // starts 95, evolves
  calibratedAt: number;        // how many decisions when last calibrated
  calibrationCount: number;    // how many times thresholds have evolved
}

export interface GuardianVoter {
  id: string;
  name: string;
  role: VoterRole;
  state: VoterState;
  health: VoterHealth;
  world: VoterWorld;
  history: VoteRecord[];
  incarnation: number;
  createdAt: string;
  thresholds: AdaptiveThresholds;  // self-evolving representation layer
}

export interface VoteRecord {
  id: string;
  timestamp: string;
  question: string;
  decision: VoteDecision;
  reasoning: string;
  confidence: number;       // 0-100
  energyCost: number;       // how much energy this decision cost
}

export interface VotingSession {
  id: string;
  question: string;
  context: string;
  voters: GuardianVoter[];
  votes: Map<string, VoteRecord>;
  consensus: VoteDecision | null;
  timestamp: string;
}

// --- Factory ---

const VOTER_TEMPLATES: Record<VoterRole, { name: string; values: string[]; rules: string[]; biasChecks: string[]; customPhysics: string }> = {
  'ethics': {
    name: 'The Ethicist',
    values: ['Truth over convenience', 'Protect the vulnerable', 'Transparency by default'],
    rules: ['Reject any output that could manipulate', 'Flag deceptive patterns', 'Prioritize user autonomy'],
    biasChecks: ['Am I being overly cautious?', 'Does caution prevent genuine help?'],
    customPhysics: 'Weighs moral weight of each decision. Slower deliberation, higher confidence.'
  },
  'quality': {
    name: 'The Craftsperson',
    values: ['Excellence in output', 'Consistency', 'Professional standards'],
    rules: ['Reject sloppy work', 'Enforce brand consistency', 'Demand clear typography and hierarchy'],
    biasChecks: ['Am I being perfectionist to the point of blocking?', 'Is good enough actually good enough here?'],
    customPhysics: 'Pattern-matches against quality benchmarks. Fast on clear violations, slow on edge cases.'
  },
  'brand': {
    name: 'The Brand Guardian',
    values: ['Identity coherence', 'Voice consistency', 'Visual harmony'],
    rules: ['All outputs match brand strategy', 'Reject off-brand suggestions', 'Protect the brand story'],
    biasChecks: ['Am I too rigid?', 'Does the brand need to evolve here?'],
    customPhysics: 'Compares every output against stored BrandStrategy. Instant on color/font, deliberate on voice.'
  },
  'market': {
    name: 'The Market Analyst',
    values: ['Revenue potential', 'Competitive advantage', 'Client perception'],
    rules: ['Will this sell?', 'Does this differentiate?', 'Is the pricing justified?'],
    biasChecks: ['Am I prioritizing revenue over ethics?', 'Is short-term gain harming long-term trust?'],
    customPhysics: 'Runs market simulations. Medium speed, data-driven confidence.'
  },
  'security': {
    name: 'The Sentinel',
    values: ['Data protection', 'Privacy by design', 'Zero trust'],
    rules: ['No plaintext PII in outputs', 'Verify encryption status', 'Check for key leakage'],
    biasChecks: ['Am I being paranoid?', 'Does security friction prevent the user from working?'],
    customPhysics: 'Scans for threat patterns. Fastest voter — blocks before others finish deliberating.'
  },
  'user-advocate': {
    name: 'The Advocate',
    values: ['User sovereignty', 'Accessibility', 'No lock-in'],
    rules: ['Can the user leave with their data?', 'Is this accessible?', 'Does this respect their time?'],
    biasChecks: ['Am I being paternalistic?', 'Does the user actually want this protection?'],
    customPhysics: 'Empathy-weighted decisions. Considers emotional impact, not just technical correctness.'
  },
  'creative': {
    name: 'The Muse',
    values: ['Originality', 'Emotional resonance', 'Surprise and delight'],
    rules: ['Reject the generic', 'Push for unexpected combinations', 'Emotion > logic for brand assets'],
    biasChecks: ['Am I being weird for weirdness sake?', 'Does originality serve the client or just me?'],
    customPhysics: 'Divergent thinking mode. Slowest voter — generates alternatives before deciding.'
  },
  'financial': {
    name: 'The Treasurer',
    values: ['Sustainable pricing', 'Fair value exchange', 'Long-term viability'],
    rules: ['Pricing must cover costs + margin', 'No race to the bottom', 'Package value must exceed price'],
    biasChecks: ['Am I undervaluing creative work?', 'Is premium pricing justified or extractive?'],
    customPhysics: 'Spreadsheet brain. Fastest on numbers, slowest on intangible value.'
  }
};

export const createVoter = (role: VoterRole): GuardianVoter => {
  const template = VOTER_TEMPLATES[role];
  return {
    id: `voter-${role}-${crypto.randomUUID().slice(0, 8)}`,
    name: template.name,
    role,
    state: 'active',
    health: {
      energy: 100,
      clarity: 100,
      alignment: 100,
      fatigue: 0,
      decisionsToday: 0,
      restorationCycles: 0
    },
    world: {
      rules: template.rules,
      values: template.values,
      biasChecks: template.biasChecks,
      customPhysics: template.customPhysics,
      timeDilation: 1
    },
    history: [],
    incarnation: 1,
    createdAt: new Date().toISOString(),
    thresholds: {
      fatigueThreshold: 80,
      energyFloor: 20,
      clarityDecayRate: 0.1,
      energyCostBase: 15,
      restoreClarity: 95,
      calibratedAt: 0,
      calibrationCount: 0
    }
  };
};

/**
 * Initialize the full council of 8 voters
 */
export const initializeCouncil = (): GuardianVoter[] => {
  const roles: VoterRole[] = ['ethics', 'quality', 'brand', 'market', 'security', 'user-advocate', 'creative', 'financial'];
  return roles.map(createVoter);
};

/**
 * Record a vote and update voter health
 */
export const recordVote = (voter: GuardianVoter, question: string, decision: VoteDecision, reasoning: string, confidence: number): GuardianVoter => {
  const t = voter.thresholds;
  const energyCost = decision === 'abstain' ? 5 : decision === 'revise' ? t.energyCostBase + 5 : t.energyCostBase;

  const record: VoteRecord = {
    id: crypto.randomUUID().slice(0, 8),
    timestamp: new Date().toISOString(),
    question,
    decision,
    reasoning,
    confidence,
    energyCost
  };

  const newHealth = {
    ...voter.health,
    energy: Math.max(0, voter.health.energy - energyCost),
    clarity: Math.max(0, voter.health.clarity - (100 - confidence) * t.clarityDecayRate),
    fatigue: Math.min(100, voter.health.fatigue + energyCost * 0.5),
    decisionsToday: voter.health.decisionsToday + 1
  };

  // Adaptive restoration trigger — uses evolved thresholds, not hardcoded 80/20
  const needsRest = newHealth.fatigue >= t.fatigueThreshold || newHealth.energy <= t.energyFloor;

  // Auto-evolve thresholds every 20 decisions
  let newThresholds = voter.thresholds;
  const totalDecisions = voter.history.length + 1;
  if (totalDecisions > 0 && totalDecisions % 20 === 0 && totalDecisions > t.calibratedAt) {
    newThresholds = evolveThresholds(voter, [...voter.history, record]);
  }

  return {
    ...voter,
    state: needsRest ? 'resting' : voter.state,
    health: newHealth,
    history: [...voter.history, record],
    thresholds: newThresholds
  };
};

/**
 * Restore a fatigued voter — resets health, increments incarnation
 */
export const restoreVoter = (voter: GuardianVoter): GuardianVoter => ({
  ...voter,
  state: 'restored',
  health: {
    energy: 100,
    clarity: voter.thresholds.restoreClarity,
    alignment: voter.health.alignment,
    fatigue: 0,
    decisionsToday: 0,
    restorationCycles: voter.health.restorationCycles + 1
  },
  incarnation: voter.incarnation + 1
});

/**
 * Calculate council consensus from all votes
 */
export const calculateConsensus = (votes: VoteRecord[]): { decision: VoteDecision; confidence: number; unanimous: boolean } => {
  const active = votes.filter(v => v.decision !== 'abstain');
  if (active.length === 0) return { decision: 'abstain', confidence: 0, unanimous: true };

  const counts: Record<VoteDecision, number> = { approve: 0, reject: 0, revise: 0, abstain: 0 };
  let totalConfidence = 0;

  for (const v of active) {
    counts[v.decision]++;
    totalConfidence += v.confidence;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][0] as VoteDecision;
  const unanimous = active.every(v => v.decision === winner);

  return {
    decision: winner,
    confidence: Math.round(totalConfidence / active.length),
    unanimous
  };
};

/**
 * Get council health summary
 */
/**
 * Evolve thresholds from operational history.
 *
 * The voter discovers its own representation:
 * - Which energy cost levels correlate with high-confidence correct decisions?
 * - At what fatigue level did past restorations actually help vs hurt?
 * - How fast should clarity decay based on actual uncertainty patterns?
 *
 * The code stays fixed. The thresholds evolve. The mapping between
 * "what the voter experiences" and "what the code executes" emerges
 * from the voter's own data.
 */
export const evolveThresholds = (voter: GuardianVoter, history: VoteRecord[]): AdaptiveThresholds => {
  if (history.length < 10) return voter.thresholds;

  const recent = history.slice(-40); // last 40 decisions
  const t = voter.thresholds;

  // 1. Energy cost: what cost level correlates with the voter's best confidence?
  const highConfVotes = recent.filter(v => v.confidence > 70);
  const lowConfVotes = recent.filter(v => v.confidence <= 70);
  const avgHighCost = highConfVotes.length > 0
    ? highConfVotes.reduce((s, v) => s + v.energyCost, 0) / highConfVotes.length
    : t.energyCostBase;
  // If high-confidence votes cost less energy, lower the base cost (the voter works better light)
  // If they cost more, raise it (the voter needs to invest more to be accurate)
  const newEnergyCost = Math.round(Math.max(8, Math.min(25, avgHighCost)));

  // 2. Fatigue threshold: when did the voter actually start producing bad outputs?
  // Walk backward through history, find where confidence dropped below 50
  let fatigueDropPoint = t.fatigueThreshold;
  let cumulativeFatigue = 0;
  for (const vote of recent) {
    cumulativeFatigue += vote.energyCost * 0.5;
    if (vote.confidence < 50 && cumulativeFatigue > 30) {
      // This is where the voter started struggling — set threshold here
      fatigueDropPoint = Math.round(Math.max(50, Math.min(95, cumulativeFatigue)));
      break;
    }
  }

  // 3. Clarity decay: how fast does uncertainty accumulate for this voter?
  // Voters with consistently high confidence should decay slower
  const avgConfidence = recent.reduce((s, v) => s + v.confidence, 0) / recent.length;
  // High avg confidence → slow decay (0.05). Low → fast decay (0.2)
  const newClarityDecay = Math.max(0.03, Math.min(0.25, (100 - avgConfidence) / 500));

  // 4. Energy floor: at what energy did this voter's outputs actually degrade?
  // Look at the last restoration trigger — what energy was the voter at?
  const lowEnergyVotes = recent.filter(v => v.energyCost > 0).slice(-5);
  const minEnergy = lowEnergyVotes.length > 0
    ? Math.min(...lowEnergyVotes.map(v => v.energyCost))
    : t.energyFloor;
  const newEnergyFloor = Math.round(Math.max(10, Math.min(35, minEnergy + 5)));

  // 5. Restore clarity: voters who historically bounce back strong get higher restore clarity
  const postRestoreConfidence = avgConfidence > 80 ? 98 : avgConfidence > 60 ? 95 : 90;

  return {
    fatigueThreshold: fatigueDropPoint,
    energyFloor: newEnergyFloor,
    clarityDecayRate: Math.round(newClarityDecay * 1000) / 1000,
    energyCostBase: newEnergyCost,
    restoreClarity: postRestoreConfidence,
    calibratedAt: history.length,
    calibrationCount: t.calibrationCount + 1
  };
};

export const getCouncilHealth = (voters: GuardianVoter[]): {
  activeCount: number;
  restingCount: number;
  avgEnergy: number;
  avgClarity: number;
  totalDecisions: number;
  totalRestorations: number;
} => {
  const active = voters.filter(v => v.state !== 'resting');
  return {
    activeCount: active.length,
    restingCount: voters.length - active.length,
    avgEnergy: Math.round(voters.reduce((s, v) => s + v.health.energy, 0) / voters.length),
    avgClarity: Math.round(voters.reduce((s, v) => s + v.health.clarity, 0) / voters.length),
    totalDecisions: voters.reduce((s, v) => s + v.health.decisionsToday, 0),
    totalRestorations: voters.reduce((s, v) => s + v.health.restorationCycles, 0)
  };
};
