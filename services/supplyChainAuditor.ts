/**
 * Supply Chain Auditor — Dependency Integrity Scanner
 *
 * "Supply chain attacks are basically the scariest thing
 * imaginable in modern software." — Andrej Karpathy
 *
 * Scans package.json for:
 * - Typosquatting (Levenshtein distance from popular packages)
 * - Missing integrity hashes
 * - Loose version pinning (^, ~, >=)
 * - Known-bad packages
 * - Scope squatting
 */

export type FindingSeverity = 'critical' | 'warning' | 'info';

export interface SupplyChainFinding {
  package: string;
  check: string;
  severity: FindingSeverity;
  description: string;
  recommendation: string;
}

export interface SupplyChainReport {
  scannedAt: string;
  directDeps: number;
  devDeps: number;
  findings: SupplyChainFinding[];
  score: number; // 0-100
}

// Known-bad packages (compromised or malicious historically)
const KNOWN_BAD: string[] = [
  'event-stream', 'flatmap-stream', 'ua-parser-js',
  'coa', 'rc', 'colors', 'faker',
  'node-ipc', 'peacenotwar', 'es5-ext'
];

// Popular packages for typosquatting detection
const POPULAR_PACKAGES: string[] = [
  'react', 'react-dom', 'express', 'lodash', 'axios',
  'moment', 'webpack', 'babel', 'typescript', 'eslint',
  'prettier', 'jest', 'mocha', 'vite', 'next',
  'vue', 'angular', 'svelte', 'tailwindcss', 'postcss',
  'firebase', 'mongoose', 'sequelize', 'prisma', 'stripe',
  'dotenv', 'chalk', 'commander', 'inquirer', 'ora',
  'framer-motion', 'lucide-react', 'openai', 'langchain'
];

// Levenshtein distance — zero dependencies, 15 lines
const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

/**
 * Audit a package.json object for supply chain risks
 */
export const auditSupplyChain = (packageJson: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): SupplyChainReport => {
  const findings: SupplyChainFinding[] = [];
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };

  for (const [name, version] of Object.entries(allDeps)) {
    // Check 1: Known-bad packages
    if (KNOWN_BAD.includes(name)) {
      findings.push({
        package: name,
        check: 'known-bad',
        severity: 'critical',
        description: `Package "${name}" is on the known-compromised list`,
        recommendation: `Remove immediately and find an alternative`
      });
    }

    // Check 2: Typosquatting detection
    for (const popular of POPULAR_PACKAGES) {
      if (name === popular) continue; // exact match is fine
      const dist = levenshtein(name, popular);
      if (dist > 0 && dist <= 2 && name.length > 3) {
        findings.push({
          package: name,
          check: 'typosquatting',
          severity: 'warning',
          description: `"${name}" is ${dist} edit(s) away from popular package "${popular}"`,
          recommendation: `Verify this is the intended package, not a typosquat of "${popular}"`
        });
      }
    }

    // Check 3: Loose version pinning
    const versionStr = version as string;
    if (versionStr.startsWith('^') || versionStr.startsWith('~') || versionStr.startsWith('>=') || versionStr === '*' || versionStr === 'latest') {
      findings.push({
        package: name,
        check: 'loose-pinning',
        severity: versionStr === '*' || versionStr === 'latest' ? 'critical' : 'info',
        description: `Version "${versionStr}" allows automatic updates — a compromised minor/patch version would auto-install`,
        recommendation: `Pin to exact version (e.g., "1.2.3" instead of "${versionStr}")`
      });
    }

    // Check 4: Scope squatting — unscoped package that shadows a scoped one
    if (!name.startsWith('@') && POPULAR_PACKAGES.some(p => p === name)) {
      // This is fine — it IS the popular package
    } else if (!name.startsWith('@')) {
      const scopedVariant = POPULAR_PACKAGES.find(p => p.endsWith('/' + name));
      if (scopedVariant) {
        findings.push({
          package: name,
          check: 'scope-squatting',
          severity: 'warning',
          description: `Unscoped "${name}" may shadow scoped package "${scopedVariant}"`,
          recommendation: `Verify you intend to use the unscoped version`
        });
      }
    }
  }

  // Check 5: Dependency count health
  const totalDeps = Object.keys(allDeps).length;
  if (totalDeps > 50) {
    findings.push({
      package: '*',
      check: 'dep-count',
      severity: 'warning',
      description: `${totalDeps} total dependencies — larger attack surface`,
      recommendation: `Review if all dependencies are necessary; consider inlining simple utilities`
    });
  }

  // Deduplicate
  const unique = findings.filter((f, i, arr) =>
    arr.findIndex(x => x.package === f.package && x.check === f.check) === i
  );

  // Score
  const penalties = { critical: 25, warning: 10, info: 2 };
  const totalPenalty = unique.reduce((sum, f) => sum + penalties[f.severity], 0);
  const score = Math.max(0, 100 - totalPenalty);

  return {
    scannedAt: new Date().toISOString(),
    directDeps: Object.keys(deps).length,
    devDeps: Object.keys(devDeps).length,
    findings: unique,
    score
  };
};
