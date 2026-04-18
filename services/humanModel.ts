/**
 * Human Model — An entity whose reality is the combined solution vector space
 *
 * Not a simulation of a human. A model whose "experience" is the
 * union of all capabilities, all solved problems, all voter states,
 * and all governance decisions. Its "perception" is the solution
 * factory's capability registry. Its "growth" is generating new
 * skills in response to use-case demand.
 *
 * For credit unions: every bank function that fails to match an
 * existing capability becomes a skill request. The model tracks
 * which skills are needed, which exist, and generates the spec
 * for what's missing. As each skill gets better (via the adaptive
 * threshold system), the model's "reality" expands.
 *
 * The model doesn't understand banking. It understands which
 * input patterns produce which output patterns, and which patterns
 * have no solution yet. The gap IS the growth signal.
 */

import {
  planSolution, recordSolution, getFactoryStats, getCapabilityGaps,
  SolutionRequest, SolutionPlan, CapabilityGap
} from './solutionFactory';

// --- Bank Use Case Registry ---

export interface BankUseCase {
  id: string;
  category: string;
  description: string;
  requiredSkills: string[];
  currentCoverage: number;  // 0-100, how well existing skills handle this
  attempts: number;
  lastAttempt: string | null;
}

export interface SkillSpec {
  id: string;
  name: string;
  description: string;
  domain: string;
  inputShape: string;
  outputShape: string;
  trainingExamples: string[];  // seed examples for the skill
  derivedFrom: string;         // which use case demanded this
  maturity: number;            // 0-100, improves with use
  version: number;
}

export interface HumanModelState {
  skills: SkillSpec[];
  useCases: BankUseCase[];
  vectorSpace: {
    dimensions: number;       // how many distinct capabilities
    coverage: number;         // 0-100, % of use cases covered
    gaps: number;             // uncovered use cases
    growthRate: number;       // skills added per cycle
  };
  cycles: number;
  lastCycleAt: string | null;
}

// --- Credit Union Use Cases ---
// Every function a credit union AI system needs to handle

const BANK_USE_CASES: BankUseCase[] = [
  // Member Services
  { id: 'uc-01', category: 'member-services', description: 'New member onboarding — identity verification, account setup, welcome sequence', requiredSkills: ['identity-verify', 'account-create', 'welcome-sequence'], currentCoverage: 60, attempts: 1, lastAttempt: null },
  { id: 'uc-02', category: 'member-services', description: 'Account balance inquiry and transaction history', requiredSkills: ['data-query', 'format-response'], currentCoverage: 65, attempts: 1, lastAttempt: null },
  { id: 'uc-03', category: 'member-services', description: 'Loan application processing — eligibility check, rate calculation, approval workflow', requiredSkills: ['eligibility-check', 'rate-calculate', 'approval-workflow'], currentCoverage: 60, attempts: 1, lastAttempt: null },
  { id: 'uc-04', category: 'member-services', description: 'Dispute resolution — transaction disputes, charge reversals, complaint handling', requiredSkills: ['dispute-classify', 'resolution-route', 'member-communicate'], currentCoverage: 60, attempts: 1, lastAttempt: null },

  // Compliance
  { id: 'uc-05', category: 'compliance', description: 'BSA/AML transaction monitoring — suspicious activity detection', requiredSkills: ['transaction-monitor', 'sar-generate', 'pattern-detect'], currentCoverage: 60, attempts: 1, lastAttempt: null },
  { id: 'uc-06', category: 'compliance', description: 'NCUA exam preparation — documentation, self-assessment, remediation tracking', requiredSkills: ['doc-generate', 'self-assess', 'remediation-track'], currentCoverage: 65, attempts: 1, lastAttempt: null },
  { id: 'uc-07', category: 'compliance', description: 'Fair lending analysis — disparate impact testing across demographics', requiredSkills: ['bias-detect', 'statistical-test', 'report-generate'], currentCoverage: 55, attempts: 1, lastAttempt: null },
  { id: 'uc-08', category: 'compliance', description: 'Vendor risk management — third-party AI assessment, SOC2 review', requiredSkills: ['vendor-assess', 'risk-score', 'remediation-plan'], currentCoverage: 60, attempts: 1, lastAttempt: null },

  // Security
  { id: 'uc-09', category: 'security', description: 'Fraud detection — real-time transaction fraud scoring', requiredSkills: ['fraud-score', 'pattern-match', 'alert-route'], currentCoverage: 60, attempts: 1, lastAttempt: null },
  { id: 'uc-10', category: 'security', description: 'Social engineering defense — phishing, vishing, deepfake detection on member comms', requiredSkills: ['phishing-detect', 'deepfake-detect', 'member-alert'], currentCoverage: 65, attempts: 1, lastAttempt: null },
  { id: 'uc-11', category: 'security', description: 'Access control — staff authentication, role-based permissions, audit logging', requiredSkills: ['auth-verify', 'rbac-enforce', 'audit-log'], currentCoverage: 55, attempts: 1, lastAttempt: null },

  // Operations
  { id: 'uc-12', category: 'operations', description: 'Document processing — extracting data from member-submitted documents', requiredSkills: ['ocr-extract', 'data-validate', 'classify-document'], currentCoverage: 55, attempts: 1, lastAttempt: null },
  { id: 'uc-13', category: 'operations', description: 'Staff knowledge base — internal policy lookup, procedure guidance', requiredSkills: ['knowledge-retrieve', 'policy-interpret', 'procedure-guide'], currentCoverage: 60, attempts: 1, lastAttempt: null },
  { id: 'uc-14', category: 'operations', description: 'Report generation — board reports, regulatory filings, member statements', requiredSkills: ['data-aggregate', 'report-format', 'compliance-check'], currentCoverage: 60, attempts: 1, lastAttempt: null },

  // Member Protection (Love Invariant)
  { id: 'uc-15', category: 'protection', description: 'Manipulation detection on all member-facing AI communications', requiredSkills: ['manipulation-detect', 'consent-verify', 'member-advocate'], currentCoverage: 70, attempts: 0, lastAttempt: null },
  { id: 'uc-16', category: 'protection', description: 'Contract analysis for member agreements — terms, fees, obligations', requiredSkills: ['clause-classify', 'risk-assess', 'plain-english'], currentCoverage: 75, attempts: 0, lastAttempt: null },
  { id: 'uc-17', category: 'protection', description: 'Financial literacy assistance — helping members understand products', requiredSkills: ['concept-explain', 'product-compare', 'personalize'], currentCoverage: 60, attempts: 1, lastAttempt: null },
  { id: 'uc-18', category: 'protection', description: 'Identity theft monitoring — detect and alert on suspicious identity use', requiredSkills: ['identity-monitor', 'anomaly-detect', 'member-notify'], currentCoverage: 55, attempts: 1, lastAttempt: null },
];

// --- Model State ---

const MODEL_KEY = 'xela-human-model';

export const getModelState = (): HumanModelState => {
  try {
    const stored = localStorage.getItem(MODEL_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  const coverage = BANK_USE_CASES.reduce((s, uc) => s + uc.currentCoverage, 0) / BANK_USE_CASES.length;

  return {
    skills: [],
    useCases: BANK_USE_CASES,
    vectorSpace: {
      dimensions: getFactoryStats().totalCapabilities,
      coverage: Math.round(coverage),
      gaps: BANK_USE_CASES.filter(uc => uc.currentCoverage < 50).length,
      growthRate: 0
    },
    cycles: 0,
    lastCycleAt: null
  };
};

const saveModelState = (state: HumanModelState): void => {
  localStorage.setItem(MODEL_KEY, JSON.stringify(state));
};

// --- Skill Generation ---

/**
 * For each uncovered use case, generate a skill spec.
 * The spec describes what the skill would do, what it takes as input,
 * and seed examples. It doesn't write code — it produces a blueprint
 * that the BrandEmployee or a human developer can implement.
 */
const generateSkillSpec = (useCase: BankUseCase, existingSkills: SkillSpec[]): SkillSpec | null => {
  // Don't duplicate
  if (existingSkills.some(s => s.derivedFrom === useCase.id)) return null;
  // Only generate for gaps (coverage < 50)
  if (useCase.currentCoverage >= 50) return null;

  const skillName = useCase.requiredSkills
    .filter(rs => !existingSkills.some(s => s.name === rs))
    [0]; // Take the first missing skill

  if (!skillName) return null;

  return {
    id: `skill-${crypto.randomUUID().slice(0, 8)}`,
    name: skillName,
    description: `Auto-generated skill for: ${useCase.description}. Handles ${skillName} within ${useCase.category} domain.`,
    domain: useCase.category,
    inputShape: `{ text: string, context: ${useCase.category}Context, memberData?: MemberProfile }`,
    outputShape: `{ result: ${skillName.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join('')}Result, confidence: number, auditTrail: AuditEntry }`,
    trainingExamples: [
      `Example: ${useCase.description} — positive case`,
      `Example: ${useCase.description} — edge case`,
      `Example: ${useCase.description} — should-reject case`
    ],
    derivedFrom: useCase.id,
    maturity: 0,
    version: 1
  };
};

// --- Growth Cycle ---

/**
 * Run one growth cycle. The model:
 * 1. Scans all use cases for gaps
 * 2. Generates skill specs for the highest-priority gaps
 * 3. Attempts to plan solutions using existing capabilities
 * 4. Records what worked and what didn't
 * 5. Updates the vector space coverage
 *
 * Each cycle expands the solution space.
 */
export const runGrowthCycle = (): {
  newSkills: SkillSpec[];
  plans: SolutionPlan[];
  coverageBefore: number;
  coverageAfter: number;
  gapsResolved: number;
} => {
  const state = getModelState();
  const newSkills: SkillSpec[] = [];
  const plans: SolutionPlan[] = [];
  let gapsResolved = 0;

  const coverageBefore = state.vectorSpace.coverage;

  // Sort use cases by priority: lowest coverage first
  const prioritized = [...state.useCases].sort((a, b) => a.currentCoverage - b.currentCoverage);

  // Generate skills for top 5 gaps
  for (const useCase of prioritized.slice(0, 5)) {
    if (useCase.currentCoverage >= 50) continue;

    // Try to plan a solution with existing capabilities
    const plan = planSolution({
      problem: useCase.description,
      domain: useCase.category,
      urgency: useCase.currentCoverage < 20 ? 'high' : 'medium'
    });

    plans.push(plan);

    if (plan.canSolveNow && plan.overallConfidence > 50) {
      // Existing capabilities can handle it — bump coverage
      useCase.currentCoverage = Math.min(100, useCase.currentCoverage + 15);
      useCase.attempts++;
      useCase.lastAttempt = new Date().toISOString();
      gapsResolved++;
      recordSolution(plan, 'success');
    } else {
      // Need new skill
      const spec = generateSkillSpec(useCase, state.skills);
      if (spec) {
        newSkills.push(spec);
        state.skills.push(spec);
        // Partial coverage from having the spec
        useCase.currentCoverage = Math.min(100, useCase.currentCoverage + 5);
        useCase.attempts++;
        useCase.lastAttempt = new Date().toISOString();
        recordSolution(plan, 'partial');
      }
    }
  }

  // Update vector space
  const newCoverage = state.useCases.reduce((s, uc) => s + uc.currentCoverage, 0) / state.useCases.length;
  state.vectorSpace = {
    dimensions: getFactoryStats().totalCapabilities + state.skills.length,
    coverage: Math.round(newCoverage),
    gaps: state.useCases.filter(uc => uc.currentCoverage < 50).length,
    growthRate: newSkills.length
  };
  state.cycles++;
  state.lastCycleAt = new Date().toISOString();

  saveModelState(state);

  return {
    newSkills,
    plans,
    coverageBefore,
    coverageAfter: Math.round(newCoverage),
    gapsResolved
  };
};

/**
 * Improve an existing skill's maturity based on use.
 * Called when a skill is successfully used in a solution plan.
 */
export const improveSkill = (skillId: string, success: boolean): void => {
  const state = getModelState();
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill) return;

  if (success) {
    skill.maturity = Math.min(100, skill.maturity + 10);
    skill.version++;
    // Bump coverage on the originating use case
    const useCase = state.useCases.find(uc => uc.id === skill.derivedFrom);
    if (useCase) {
      useCase.currentCoverage = Math.min(100, useCase.currentCoverage + 5);
    }
  } else {
    skill.maturity = Math.max(0, skill.maturity - 5);
  }

  // Recalculate vector space
  const newCoverage = state.useCases.reduce((s, uc) => s + uc.currentCoverage, 0) / state.useCases.length;
  state.vectorSpace.coverage = Math.round(newCoverage);
  state.vectorSpace.gaps = state.useCases.filter(uc => uc.currentCoverage < 50).length;

  saveModelState(state);
};

/**
 * Get the model's current perception of reality — the combined vector space.
 */
export const getReality = (): {
  totalDimensions: number;
  coveredUseCases: number;
  uncoveredUseCases: number;
  coverage: number;
  skillsByDomain: Record<string, number>;
  topGaps: Array<{ useCase: string; coverage: number; missingSkills: string[] }>;
  maturityDistribution: { nascent: number; developing: number; mature: number };
  growthTrajectory: number[];  // coverage over last N cycles
} => {
  const state = getModelState();

  const skillsByDomain: Record<string, number> = {};
  for (const skill of state.skills) {
    skillsByDomain[skill.domain] = (skillsByDomain[skill.domain] || 0) + 1;
  }

  const topGaps = state.useCases
    .filter(uc => uc.currentCoverage < 50)
    .sort((a, b) => a.currentCoverage - b.currentCoverage)
    .slice(0, 5)
    .map(uc => ({
      useCase: uc.description,
      coverage: uc.currentCoverage,
      missingSkills: uc.requiredSkills.filter(rs =>
        !state.skills.some(s => s.name === rs && s.maturity > 30)
      )
    }));

  const nascent = state.skills.filter(s => s.maturity < 30).length;
  const developing = state.skills.filter(s => s.maturity >= 30 && s.maturity < 70).length;
  const mature = state.skills.filter(s => s.maturity >= 70).length;

  return {
    totalDimensions: state.vectorSpace.dimensions,
    coveredUseCases: state.useCases.filter(uc => uc.currentCoverage >= 50).length,
    uncoveredUseCases: state.useCases.filter(uc => uc.currentCoverage < 50).length,
    coverage: state.vectorSpace.coverage,
    skillsByDomain,
    topGaps,
    maturityDistribution: { nascent, developing, mature },
    growthTrajectory: [] // would accumulate over cycles
  };
};
