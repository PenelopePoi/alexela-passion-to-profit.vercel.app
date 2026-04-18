/**
 * Solution Factory — Self-expanding capability generator
 *
 * Given a problem description, produces:
 * 1. A geminiService function spec (what to call, what it returns)
 * 2. A solution plan (which existing capabilities to compose)
 * 3. A confidence score (can the system solve this with what it has?)
 * 4. A gap analysis (what new capability would be needed if it can't)
 *
 * The factory doesn't write code — it produces executable plans
 * that the BrandEmployee can run, or that surface as actionable
 * recommendations in the dashboard.
 *
 * Over time, the factory accumulates solved problems in its memory.
 * Each solved problem becomes a template for similar future problems.
 * The solution space grows with use.
 */

// --- Types ---

export interface SolutionRequest {
  problem: string;           // natural language description
  domain?: string;           // optional: 'branding' | 'security' | 'compliance' | 'creative' | 'business'
  urgency?: 'low' | 'medium' | 'high';
  constraints?: string[];    // things the solution must NOT do
}

export interface SolutionStep {
  id: string;
  action: string;            // what to do
  functionName: string;      // which geminiService function (or 'NEW' if capability gap)
  inputFrom: string | null;  // which step provides input (null = user input)
  expectedOutput: string;    // what this step produces
  confidence: number;        // 0-100, how confident the factory is this step works
}

export interface SolutionPlan {
  id: string;
  problem: string;
  domain: string;
  steps: SolutionStep[];
  overallConfidence: number;
  gaps: CapabilityGap[];
  estimatedSteps: number;
  canSolveNow: boolean;      // true if all steps use existing functions
  createdAt: string;
}

export interface CapabilityGap {
  description: string;       // what's missing
  suggestedFunction: string; // what a new geminiService function would be called
  suggestedInputs: string;   // what it would take as input
  suggestedOutput: string;   // what it would return
  priority: 'critical' | 'helpful' | 'nice-to-have';
}

export interface SolvedProblem {
  id: string;
  problem: string;
  domain: string;
  plan: SolutionPlan;
  outcome: 'success' | 'partial' | 'failed';
  timestamp: string;
  reusableAs: string[];      // tags for template matching
}

// --- Capability Registry ---
// Maps what the system CAN do right now

const EXISTING_CAPABILITIES: Array<{
  name: string;
  function: string;
  domain: string;
  accepts: string;
  returns: string;
  tags: string[];
}> = [
  // Branding
  { name: 'Brand Strategy', function: 'generateBrandStrategy', domain: 'branding', accepts: 'BrandInput', returns: 'BrandStrategy', tags: ['strategy', 'taglines', 'mission', 'vision', 'colors', 'typography'] },
  { name: 'Business Names', function: 'generateBusinessNames', domain: 'branding', accepts: 'industry, vibe, location', returns: 'string[]', tags: ['naming', 'brainstorm'] },
  { name: 'Mottos', function: 'generateMottos', domain: 'branding', accepts: 'industry, vibe, companyName', returns: 'string[]', tags: ['slogans', 'taglines', 'mottos'] },
  { name: 'Logo Concepts', function: 'generateLogoConcepts', domain: 'creative', accepts: 'BrandInput, style, color', returns: 'image[]', tags: ['logo', 'visual', 'design'] },
  { name: 'Brand Guidelines', function: 'generateBrandGuidelines', domain: 'branding', accepts: 'BrandInput, BrandStrategy', returns: 'BrandGuidelines', tags: ['guidelines', 'usage', 'standards'] },
  { name: 'Brand Story', function: 'generateBrandStory', domain: 'branding', accepts: 'BrandInput, BrandStrategy', returns: 'string', tags: ['narrative', 'origin', 'story'] },
  // Marketing
  { name: 'Content Calendar', function: 'generateContentCalendar', domain: 'marketing', accepts: 'BrandInput, BrandStrategy', returns: 'ContentCalendarDay[]', tags: ['social', 'calendar', 'content', 'planning'] },
  { name: 'Email Templates', function: 'generateEmailTemplates', domain: 'marketing', accepts: 'BrandInput, BrandStrategy', returns: 'EmailTemplate[]', tags: ['email', 'marketing', 'drip'] },
  { name: 'Ad Assets', function: 'generateAdAssets', domain: 'marketing', accepts: 'BrandInput, BrandStrategy', returns: 'ad concepts', tags: ['ads', 'video', 'scripts', 'marketing'] },
  { name: 'Sales Pitch', function: 'generateSalesPitch', domain: 'marketing', accepts: 'BrandInput, BrandStrategy', returns: 'string', tags: ['pitch', 'sales', 'persuasion'] },
  { name: 'Flyer Copy', function: 'generateFlyerCopy', domain: 'marketing', accepts: 'BrandInput, BrandStrategy', returns: '{headline, hook, callToAction}', tags: ['flyer', 'print', 'copy'] },
  { name: 'Call Script', function: 'generateCallScript', domain: 'marketing', accepts: 'BrandInput, BrandStrategy, client info', returns: 'CallScript', tags: ['call', 'script', 'sales', 'phone'] },
  // Creative
  { name: 'Image Generation', function: 'generateImageNanoBananaPro', domain: 'creative', accepts: 'prompt, size, ratio', returns: 'base64 image', tags: ['image', 'generate', 'visual'] },
  { name: 'Video Generation', function: 'generateVideoVeo', domain: 'creative', accepts: 'prompt, image?, ratio', returns: 'video URI', tags: ['video', 'generate', 'motion'] },
  { name: 'Song Lyrics', function: 'generateSongLyrics', domain: 'creative', accepts: 'BrandInput, genre, topic', returns: '{title, lyrics}', tags: ['music', 'lyrics', 'jingle'] },
  { name: 'Speech/TTS', function: 'generateSpeech', domain: 'creative', accepts: 'text', returns: 'base64 audio', tags: ['speech', 'audio', 'voice', 'tts'] },
  // Intelligence
  { name: 'Competitor Analysis', function: 'analyzeCompetitor', domain: 'intelligence', accepts: 'BrandInput, URL', returns: 'CompetitorAnalysis', tags: ['competitor', 'analysis', 'research'] },
  { name: 'Revenue Projection', function: 'generateRevenueProjection', domain: 'intelligence', accepts: 'tier, price, industry, location, goal', returns: 'RevenueProjection', tags: ['revenue', 'forecast', 'roi'] },
  { name: 'Pitch Deck', function: 'generatePitchDeck', domain: 'intelligence', accepts: 'BrandInput, BrandStrategy', returns: 'PitchDeck', tags: ['investor', 'pitch', 'deck', 'funding'] },
  { name: 'Grant Proposal', function: 'generateGrantProposal', domain: 'intelligence', accepts: 'BrandInput, BrandStrategy, grant details', returns: 'GrantProposal', tags: ['grant', 'proposal', 'funding', 'application'] },
  // Business
  { name: 'Branding Packages', function: 'generateBrandingPackages', domain: 'business', accepts: 'BrandInput', returns: 'BrandingPackage[]', tags: ['packages', 'pricing', 'tiers'] },
  { name: 'White Label Kit', function: 'generateWhiteLabelKit', domain: 'business', accepts: 'BrandInput, BrandStrategy, clientName', returns: 'WhiteLabelKit', tags: ['white-label', 'export', 'client'] },
  { name: 'Format Bridge', function: 'translateBrandFormat', domain: 'business', accepts: 'BrandInput, BrandStrategy, format', returns: '{content, filename}', tags: ['export', 'css', 'canva', 'figma', 'format'] },
  { name: 'Asset Bundle', function: 'generateAssetBundleManifest', domain: 'creative', accepts: 'BrandInput, BrandStrategy', returns: 'BundleManifest', tags: ['assets', 'stock', 'bundle', 'media'] },
  // Security / Governance
  { name: 'Challenge Kit', function: 'generateChallengeKit', domain: 'marketing', accepts: 'industry, location', returns: 'ChallengeKit', tags: ['challenge', 'contest', 'community'] },
  { name: 'Brand Certificate', function: 'generateBrandCertificate', domain: 'security', accepts: 'BrandInput, BrandStrategy, hash, timestamp', returns: 'string', tags: ['certificate', 'proof', 'authorship'] },
  { name: 'Vault Manifest', function: 'generateBrandVaultManifest', domain: 'security', accepts: 'BrandInput, BrandStrategy', returns: 'string', tags: ['vault', 'backup', 'offline', 'export'] },
];

// --- Solution Memory ---

const MEMORY_KEY = 'xela-solution-factory';

const getMemory = (): SolvedProblem[] => {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveMemory = (memory: SolvedProblem[]): void => {
  // Keep last 200 solved problems
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory.slice(-200)));
};

// --- Matching ---

/**
 * Find capabilities that match a problem description via tag overlap.
 * Returns sorted by relevance (most tag matches first).
 */
const findMatchingCapabilities = (problem: string, domain?: string) => {
  const words = problem.toLowerCase().split(/\s+/);

  return EXISTING_CAPABILITIES
    .filter(cap => !domain || cap.domain === domain || domain === 'any')
    .map(cap => {
      const tagMatches = cap.tags.filter(tag =>
        words.some(w => w.includes(tag) || tag.includes(w))
      ).length;
      const nameMatch = words.some(w => cap.name.toLowerCase().includes(w)) ? 2 : 0;
      return { ...cap, relevance: tagMatches + nameMatch };
    })
    .filter(cap => cap.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
};

/**
 * Find previously solved similar problems via tag overlap.
 */
const findSimilarSolutions = (problem: string): SolvedProblem[] => {
  const memory = getMemory();
  const words = problem.toLowerCase().split(/\s+/);

  return memory
    .filter(solved => {
      const tagMatches = solved.reusableAs.filter(tag =>
        words.some(w => w.includes(tag) || tag.includes(w))
      ).length;
      return tagMatches > 0;
    })
    .sort((a, b) => {
      // Prefer successful solutions
      const aScore = a.outcome === 'success' ? 3 : a.outcome === 'partial' ? 1 : 0;
      const bScore = b.outcome === 'success' ? 3 : b.outcome === 'partial' ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 5);
};

// --- Plan Generation ---

/**
 * Generate a solution plan for a problem.
 * The plan composes existing capabilities and identifies gaps.
 */
export const planSolution = (request: SolutionRequest): SolutionPlan => {
  const matches = findMatchingCapabilities(request.problem, request.domain);
  const similar = findSimilarSolutions(request.problem);

  const steps: SolutionStep[] = [];
  const gaps: CapabilityGap[] = [];

  // If we have a previously successful similar solution, use its plan as template
  if (similar.length > 0 && similar[0].outcome === 'success') {
    const template = similar[0].plan;
    return {
      ...template,
      id: crypto.randomUUID().slice(0, 12),
      problem: request.problem,
      createdAt: new Date().toISOString(),
      overallConfidence: Math.min(template.overallConfidence + 5, 95), // slightly more confident from precedent
    };
  }

  // Build plan from matching capabilities
  if (matches.length === 0) {
    // No matches — pure gap
    gaps.push({
      description: `No existing capability matches: "${request.problem}"`,
      suggestedFunction: `generate${request.problem.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join('').slice(0, 30)}`,
      suggestedInputs: 'BrandInput, BrandStrategy',
      suggestedOutput: 'Generated content',
      priority: 'critical'
    });
  } else {
    // Build step chain from matches
    let prevStepId: string | null = null;
    for (let i = 0; i < Math.min(matches.length, 6); i++) {
      const cap = matches[i];
      const stepId = `step-${i + 1}`;
      steps.push({
        id: stepId,
        action: `Generate ${cap.name}`,
        functionName: cap.function,
        inputFrom: i === 0 ? null : prevStepId,
        expectedOutput: cap.returns,
        confidence: Math.max(30, 90 - i * 15) // first match is most confident
      });
      prevStepId = stepId;
    }
  }

  const overallConfidence = steps.length > 0
    ? Math.round(steps.reduce((s, st) => s + st.confidence, 0) / steps.length)
    : 0;

  return {
    id: crypto.randomUUID().slice(0, 12),
    problem: request.problem,
    domain: request.domain || 'any',
    steps,
    overallConfidence,
    gaps,
    estimatedSteps: steps.length,
    canSolveNow: gaps.length === 0 && steps.length > 0,
    createdAt: new Date().toISOString()
  };
};

/**
 * Record a solved problem for future template matching.
 */
export const recordSolution = (
  plan: SolutionPlan,
  outcome: 'success' | 'partial' | 'failed'
): void => {
  const memory = getMemory();
  const words = plan.problem.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  memory.push({
    id: plan.id,
    problem: plan.problem,
    domain: plan.domain,
    plan,
    outcome,
    timestamp: new Date().toISOString(),
    reusableAs: words
  });

  saveMemory(memory);
};

// --- Factory Stats ---

export const getFactoryStats = (): {
  totalCapabilities: number;
  byDomain: Record<string, number>;
  solvedProblems: number;
  successRate: number;
  topTemplates: Array<{ problem: string; outcome: string; reuses: number }>;
} => {
  const memory = getMemory();
  const byDomain: Record<string, number> = {};
  for (const cap of EXISTING_CAPABILITIES) {
    byDomain[cap.domain] = (byDomain[cap.domain] || 0) + 1;
  }

  const successes = memory.filter(m => m.outcome === 'success').length;

  // Count template reuses
  const templateCounts: Record<string, number> = {};
  for (const solved of memory) {
    const key = solved.problem.slice(0, 50);
    templateCounts[key] = (templateCounts[key] || 0) + 1;
  }

  const topTemplates = Object.entries(templateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([problem, reuses]) => {
      const solved = memory.find(m => m.problem.startsWith(problem));
      return { problem, outcome: solved?.outcome || 'unknown', reuses };
    });

  return {
    totalCapabilities: EXISTING_CAPABILITIES.length,
    byDomain,
    solvedProblems: memory.length,
    successRate: memory.length > 0 ? Math.round((successes / memory.length) * 100) : 0,
    topTemplates
  };
};

/**
 * Get all capability gaps identified across all failed/partial solutions.
 * These are the things the system knows it can't do yet.
 */
export const getCapabilityGaps = (): CapabilityGap[] => {
  const memory = getMemory();
  const allGaps: CapabilityGap[] = [];

  for (const solved of memory) {
    if (solved.plan.gaps.length > 0) {
      allGaps.push(...solved.plan.gaps);
    }
  }

  // Deduplicate by description
  return allGaps.filter((gap, i, arr) =>
    arr.findIndex(g => g.suggestedFunction === gap.suggestedFunction) === i
  );
};
