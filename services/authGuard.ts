/**
 * Auth Guard Service
 * Gates access to dashboard and other sensitive views.
 * Prevents random users from abusing the site.
 */

export function hasValidProjectSession(): boolean {
  try {
    const projects = localStorage.getItem('brand_projects');
    if (projects) {
      const parsed = JSON.parse(projects);
      return Array.isArray(parsed) && parsed.length > 0;
    }
    return false;
  } catch {
    return false;
  }
}

export function hasActiveIntake(): boolean {
  try {
    // Check for any in-progress intake draft
    const consultDraft = localStorage.getItem('xela_consultation_draft');
    const chatDraft = localStorage.getItem('xela-chat-intake');
    const shufflerCurrent = localStorage.getItem('xela_intake_current');
    return !!(consultDraft || chatDraft || shufflerCurrent);
  } catch {
    return false;
  }
}

export type ViewStep = 'landing' | 'intake' | 'dashboard' | 'consult' | 'chat' | 'shuffle';

export function canAccessView(step: ViewStep): { allowed: boolean; reason?: string; redirectTo?: ViewStep } {
  // Landing, consult, chat, shuffle are always public
  if (step === 'landing' || step === 'consult' || step === 'chat' || step === 'shuffle') {
    return { allowed: true };
  }

  // Intake needs either a selected package or active draft
  if (step === 'intake') {
    return { allowed: true }; // Intake is accessible via package selection flow
  }

  // Dashboard requires a valid project session
  if (step === 'dashboard') {
    if (!hasValidProjectSession()) {
      return {
        allowed: false,
        reason: 'Dashboard requires a completed project. Start by submitting an intake form.',
        redirectTo: 'landing',
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

export function hasStudioLicense(): boolean {
  try {
    const license = localStorage.getItem('xela_studio_license');
    if (!license) return false;
    const parsed = JSON.parse(license);
    if (parsed.tier === 'lifetime') return true;
    return parsed.valid === true && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Check if a visitor is exhibiting suspicious behavior
 * (rapid-fire clicks, likely bot or script)
 */
export function isSuspiciousActivity(): boolean {
  try {
    const key = 'xela_click_history';
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const clicks: number[] = raw ? JSON.parse(raw) : [];
    // Keep only clicks from the last 10 seconds
    const recent = clicks.filter(t => now - t < 10000);
    recent.push(now);
    localStorage.setItem(key, JSON.stringify(recent.slice(-50)));
    // More than 20 clicks in 10 seconds = suspicious
    return recent.length > 20;
  } catch {
    return false;
  }
}

/**
 * Verify intent to access a paid action (like Stripe checkout)
 * Requires the user to have explicitly clicked something recently
 */
export function verifyIntentToPurchase(): boolean {
  try {
    const intent = localStorage.getItem('xela_intent_to_purchase');
    if (!intent) return false;
    const parsed = JSON.parse(intent);
    // Intent is valid for 5 minutes after being set
    return parsed.timestamp > Date.now() - 5 * 60 * 1000;
  } catch {
    return false;
  }
}

export function setIntentToPurchase(): void {
  try {
    localStorage.setItem('xela_intent_to_purchase', JSON.stringify({ timestamp: Date.now() }));
  } catch {}
}

export function clearIntentToPurchase(): void {
  try {
    localStorage.removeItem('xela_intent_to_purchase');
  } catch {}
}
