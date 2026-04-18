/**
 * Studio License Service
 * Gates "Clone This Studio" feature behind a paid license.
 * Three tiers: Starter ($299/30 days), Pro ($999/365 days), Lifetime ($2999)
 */

export type LicenseTier = 'starter' | 'pro' | 'lifetime';

export interface LicenseTierConfig {
  id: LicenseTier;
  name: string;
  price: number;
  duration: number; // days, -1 = lifetime
  features: string[];
  popular?: boolean;
}

export const LICENSE_TIERS: Record<LicenseTier, LicenseTierConfig> = {
  starter: {
    id: 'starter',
    name: 'Studio Starter',
    price: 299,
    duration: 30,
    features: [
      'Clone studio template once',
      '30 days of access',
      'Basic brand strategy generation',
      'Export brand assets',
      'Email support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Studio Pro',
    price: 999,
    duration: 365,
    features: [
      'Unlimited clones for 1 year',
      'Full brand strategy + logos',
      'All marketing materials',
      'Social media kit',
      'Priority support',
      'Commercial use rights',
    ],
    popular: true,
  },
  lifetime: {
    id: 'lifetime',
    name: 'Studio Lifetime',
    price: 2999,
    duration: -1,
    features: [
      'Unlimited clones forever',
      'All future updates included',
      'White-label rights',
      'Resell to your clients',
      'Lifetime priority support',
      'Private onboarding call',
      'Co-marketing opportunities',
    ],
  },
};

export interface LicenseRecord {
  tier: LicenseTier;
  valid: boolean;
  purchasedAt: number;
  expiresAt: number; // -1 for lifetime
  licenseKey: string;
}

const STORAGE_KEY = 'xela_studio_license';

/**
 * Check if the user has a valid, non-expired license
 */
export function hasValidLicense(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed: LicenseRecord = JSON.parse(raw);
    if (!parsed.valid) return false;
    if (parsed.tier === 'lifetime') return true;
    return parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Get the current license details
 */
export function getCurrentLicense(): LicenseRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Store a license after successful purchase
 */
export function activateLicense(tier: LicenseTier, licenseKey: string): void {
  const config = LICENSE_TIERS[tier];
  const now = Date.now();
  const expiresAt = config.duration === -1 ? -1 : now + config.duration * 24 * 60 * 60 * 1000;
  const record: LicenseRecord = {
    tier,
    valid: true,
    purchasedAt: now,
    expiresAt,
    licenseKey,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {}
}

/**
 * Generate a pseudo license key (for demo purposes)
 * In production, this would come from the Stripe webhook
 */
export function generateLicenseKey(tier: LicenseTier): string {
  const prefix = tier.toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  const checksum = Date.now().toString(36).slice(-4).toUpperCase();
  return `XELA-${prefix}-${random}-${checksum}`;
}

/**
 * Get days remaining on current license
 */
export function getDaysRemaining(): number | null {
  const license = getCurrentLicense();
  if (!license || !license.valid) return null;
  if (license.tier === 'lifetime') return Infinity;
  const remaining = license.expiresAt - Date.now();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

/**
 * Revoke the current license (for testing/admin)
 */
export function revokeLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
