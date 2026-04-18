/**
 * Binary Filter — Live scanning of production build output
 *
 * Scans dist/ JavaScript bundles for:
 * - API keys (AIza*, sk-*, ghp_*, etc.)
 * - Email addresses
 * - Phone numbers
 * - Hardcoded passwords/secrets
 * - Firebase config values that shouldn't be there
 * - Base64 encoded data over threshold size
 *
 * Returns a report of findings with severity levels.
 */

export type FindingSeverity = 'critical' | 'warning' | 'info';

export interface BinaryFinding {
  pattern: string;
  match: string;       // redacted: first 4 chars + "..."
  severity: FindingSeverity;
  description: string;
  line?: number;
}

export interface BinaryReport {
  scannedAt: string;
  fileSize: number;
  findings: BinaryFinding[];
  score: number;  // 0-100, 100 = clean
}

// Patterns to scan for
const SCAN_PATTERNS: Array<{
  name: string;
  regex: RegExp;
  severity: FindingSeverity;
  description: string;
  allowlist?: RegExp;  // skip matches that match this
}> = [
  {
    name: 'Google API Key',
    regex: /AIzaSy[a-zA-Z0-9_-]{33}/g,
    severity: 'info',  // Firebase client keys are expected
    description: 'Google/Firebase API key (expected for client-side Firebase)',
    allowlist: undefined
  },
  {
    name: 'OpenAI Key',
    regex: /sk-[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
    description: 'OpenAI API key leaked into bundle'
  },
  {
    name: 'GitHub Token',
    regex: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    description: 'GitHub personal access token leaked'
  },
  {
    name: 'Generic Secret',
    regex: /(?:secret|password|token|apikey|api_key)\s*[:=]\s*["'][^"']{8,}["']/gi,
    severity: 'warning',
    description: 'Possible hardcoded secret or credential'
  },
  {
    name: 'Email Address',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    severity: 'warning',
    description: 'Email address in bundle (potential PII leak)',
    allowlist: /noreply|example\.com|placeholder/i
  },
  {
    name: 'Phone Number',
    regex: /\(\d{3}\)\s?\d{3}-\d{4}/g,
    severity: 'warning',
    description: 'Phone number pattern in bundle'
  },
  {
    name: 'Private Key Block',
    regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
    severity: 'critical',
    description: 'Private key embedded in bundle'
  },
  {
    name: 'Large Base64 Blob',
    regex: /(?:[A-Za-z0-9+/]{100,}={0,2})/g,
    severity: 'info',
    description: 'Large base64-encoded data (possible embedded asset)'
  },
  {
    name: 'Gemini API Key Env',
    regex: /GEMINI_API_KEY[^a-zA-Z]/g,
    severity: 'warning',
    description: 'Reference to Gemini API key variable in bundle'
  }
];

/**
 * Scan a text string (typically the contents of the built JS bundle) for sensitive patterns.
 */
export const scanBinary = (content: string): BinaryReport => {
  const findings: BinaryFinding[] = [];

  for (const pattern of SCAN_PATTERNS) {
    const matches = content.matchAll(pattern.regex);
    for (const match of matches) {
      const matchStr = match[0];

      // Check allowlist
      if (pattern.allowlist && pattern.allowlist.test(matchStr)) continue;

      // Redact the match
      const redacted = matchStr.length > 8
        ? matchStr.slice(0, 4) + '...' + matchStr.slice(-4)
        : matchStr.slice(0, 4) + '...';

      findings.push({
        pattern: pattern.name,
        match: redacted,
        severity: pattern.severity,
        description: pattern.description,
      });
    }
  }

  // Deduplicate by pattern + match
  const unique = findings.filter((f, i, arr) =>
    arr.findIndex(x => x.pattern === f.pattern && x.match === f.match) === i
  );

  // Score: start at 100, subtract per finding
  const penalties = { critical: 25, warning: 10, info: 2 };
  const totalPenalty = unique.reduce((sum, f) => sum + penalties[f.severity], 0);
  const score = Math.max(0, 100 - totalPenalty);

  return {
    scannedAt: new Date().toISOString(),
    fileSize: content.length,
    findings: unique,
    score
  };
};

/**
 * Scan the actual dist/ build output.
 * In browser context, this fetches the main JS bundle.
 * Returns null if dist is not accessible.
 */
export const scanProductionBuild = async (): Promise<BinaryReport | null> => {
  try {
    // In dev, try to fetch the built bundle
    // This works when running from the same origin as the dist
    const response = await fetch('/assets/index.js');
    if (!response.ok) return null;
    const content = await response.text();
    return scanBinary(content);
  } catch {
    return null;
  }
};
