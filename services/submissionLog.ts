/**
 * Submission Log Service
 *
 * SECURITY / PRIVACY NOTICE — INTERNAL USE ONLY
 * ---------------------------------------------
 * This module persists client intake data (names, emails, phones) to the
 * browser's localStorage so the internal owner dashboard (SubmissionsInbox)
 * can review leads. localStorage is readable by ANY script running on this
 * origin — therefore:
 *   - This log MUST only be viewed on a trusted device by the business owner.
 *   - NEVER store auth tokens, passwords, payment data, SSNs, or government IDs.
 *   - Sensitive-looking keys are stripped on write as a defense in depth.
 *   - The log is hard-capped at MAX_LOG_SIZE entries (oldest evicted).
 *   - Do not embed this component on a public route.
 */

// Defense-in-depth: keys we refuse to persist even if accidentally passed in.
import { getCurrentDepth } from './alexSignal';

const SENSITIVE_KEYS = new Set([
  'password', 'passwd', 'pwd', 'token', 'accessToken', 'refreshToken',
  'apiKey', 'api_key', 'secret', 'ssn', 'creditCard', 'cardNumber',
  'cvv', 'cvc', 'pin', 'authorization',
]);

function sanitizeData(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (SENSITIVE_KEYS.has(k)) continue;
    if (/password|secret|token|ssn|cvv|cvc/i.test(k)) continue;
    clean[k] = v;
  }
  return clean;
}

export type SubmissionSource =
  | 'consultation-wizard'
  | 'chat-intake'
  | 'input-form'
  | 'standalone-html'
  | 'intake-shuffler';

export type SubmissionStatus = 'new' | 'reviewed' | 'contacted' | 'quoted' | 'closed-won' | 'closed-lost';

export interface SubmissionRecord {
  id: string;
  timestamp: number;
  source: SubmissionSource;
  variantId?: number;
  data: Record<string, any>;
  status: SubmissionStatus;
  actionItems: string[];
  emailSent: boolean;
  notes?: string;
}

const STORAGE_KEY = 'xela_submissions_log';
const MAX_LOG_SIZE = 500;
const RATE_LIMIT_KEY = 'xela_submissions_last_ts';
const RATE_LIMIT_MS = 3000; // 3s between submissions per browser

/**
 * Returns true if a new submission is allowed right now (debounce protection
 * against accidental double-clicks and rapid-fire spam from this browser).
 * Records the timestamp on success.
 */
export function rateLimitOk(): boolean {
  try {
    const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
    const now = Date.now();
    if (now - last < RATE_LIMIT_MS) return false;
    localStorage.setItem(RATE_LIMIT_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

/**
 * Log a new submission — writes to localStorage and returns the record
 */
export function logSubmission(
  source: SubmissionSource,
  data: Record<string, any>,
  variantId?: number
): SubmissionRecord {
  const safeData = sanitizeData(data);
  const clientDepth = getCurrentDepth();
  if (clientDepth) safeData.clientDepth = clientDepth;
  const record: SubmissionRecord = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    source,
    variantId,
    data: safeData,
    status: 'new',
    actionItems: generateActionItems(safeData),
    emailSent: false,
  };

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const log: SubmissionRecord[] = existing ? JSON.parse(existing) : [];
    log.unshift(record); // newest first
    if (log.length > MAX_LOG_SIZE) log.length = MAX_LOG_SIZE;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // Intentionally swallow — never log PII to console on failure.
  }

  return record;
}

/**
 * Get all submissions, optionally filtered by status
 */
export function getSubmissions(status?: SubmissionStatus): SubmissionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const log: SubmissionRecord[] = JSON.parse(raw);
    return status ? log.filter(r => r.status === status) : log;
  } catch {
    return [];
  }
}

/**
 * Get a single submission by ID
 */
export function getSubmission(id: string): SubmissionRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const log: SubmissionRecord[] = JSON.parse(raw);
    return log.find(r => r.id === id) || null;
  } catch {
    return null;
  }
}

/**
 * Update a submission's status
 */
export function updateSubmissionStatus(id: string, status: SubmissionStatus): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const log: SubmissionRecord[] = JSON.parse(raw);
    const idx = log.findIndex(r => r.id === id);
    if (idx >= 0) {
      log[idx].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    }
  } catch {}
}

/**
 * Update a submission's notes
 */
export function updateSubmissionNotes(id: string, notes: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const log: SubmissionRecord[] = JSON.parse(raw);
    const idx = log.findIndex(r => r.id === id);
    if (idx >= 0) {
      log[idx].notes = notes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    }
  } catch {}
}

/**
 * Mark a submission as having had its email sent
 */
export function markEmailSent(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const log: SubmissionRecord[] = JSON.parse(raw);
    const idx = log.findIndex(r => r.id === id);
    if (idx >= 0) {
      log[idx].emailSent = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    }
  } catch {}
}

/**
 * Get submission counts by status
 */
export function getSubmissionStats(): Record<SubmissionStatus, number> & { total: number; today: number; thisWeek: number } {
  const submissions = getSubmissions();
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const stats = {
    new: 0,
    reviewed: 0,
    contacted: 0,
    quoted: 0,
    'closed-won': 0,
    'closed-lost': 0,
    total: submissions.length,
    today: 0,
    thisWeek: 0,
  };

  submissions.forEach(s => {
    stats[s.status] = (stats[s.status] || 0) + 1;
    if (s.timestamp >= oneDayAgo) stats.today++;
    if (s.timestamp >= oneWeekAgo) stats.thisWeek++;
  });

  return stats;
}

/**
 * Export all submissions as a downloadable JSON file
 * For Claude Code review or data export
 */
export function exportSubmissions(): void {
  const log = getSubmissions();
  const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xela-submissions-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Delete a submission (use sparingly — prefer updating status to 'closed-lost')
 */
export function deleteSubmission(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const log: SubmissionRecord[] = JSON.parse(raw);
    const filtered = log.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
}

/**
 * Generate smart action items from intake data
 */
function generateActionItems(data: Record<string, any>): string[] {
  const items: string[] = [];
  const name = data.companyName || 'client';

  items.push(`Review intake for ${name}`);

  if (data.industry) {
    items.push(`Research ${data.industry} competitors in ${data.location || 'their area'}`);
  }

  if (data.vibe) {
    items.push(`Prepare ${data.vibe} brand direction mood board`);
  }

  if (data.services && Array.isArray(data.services) && data.services.length > 0) {
    items.push(`Scope ${data.services.length} services into package tier`);
  }

  if (data.phone && (data.preferredContact === 'call' || (Array.isArray(data.preferredContact) && data.preferredContact.includes('call')))) {
    items.push(`Call ${data.phone} within 2 hours`);
  } else if (data.email) {
    items.push(`Send welcome email to ${data.email}`);
  }

  items.push(`Draft personalized quote`);
  items.push(`Create CRM deal and project folder`);

  if (data.additionalNotes) {
    items.push(`Review additional notes from client`);
  }

  return items;
}
