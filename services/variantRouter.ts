/**
 * A/B/C/D variant detection
 * - URL param ?v=a|b|c|d wins
 * - Else localStorage['xela_variant']
 * - Else random assignment, stored in localStorage
 */

export type SiteVariant = 'a' | 'b' | 'c' | 'd';

export interface VariantConfig {
  id: SiteVariant;
  name: string;
  hero: {
    headline: string;
    subheadline: string;
    ctaLabel: string;
    accentColor: string;
  };
  intakePath: 'wizard' | 'chat' | 'shuffle' | 'form'; // Which intake path this variant pushes
  pricingFirst: boolean; // Show pricing above the fold?
  trustSignal: 'scripture' | 'guarantee' | 'speed' | 'local';
  theme: 'midnight-teal' | 'neon-lavender' | 'paper-warm' | 'glass-frost';
}

export const VARIANTS: Record<SiteVariant, VariantConfig> = {
  a: {
    id: 'a',
    name: 'Urgency + Scripture',
    hero: {
      headline: 'From Pain to Purpose.',
      subheadline: 'Built with heart. Delivered same day.',
      ctaLabel: 'Start Your Brand',
      accentColor: 'brand-teal',
    },
    intakePath: 'wizard',
    pricingFirst: false,
    trustSignal: 'scripture',
    theme: 'midnight-teal',
  },
  b: {
    id: 'b',
    name: 'Bold + Chat-First',
    hero: {
      headline: 'Your Brand, Ready Today.',
      subheadline: 'Chat with us. We build it. You launch.',
      ctaLabel: 'Chat With Xela',
      accentColor: 'brand-lavender',
    },
    intakePath: 'chat',
    pricingFirst: false,
    trustSignal: 'speed',
    theme: 'neon-lavender',
  },
  c: {
    id: 'c',
    name: 'Transparent Pricing',
    hero: {
      headline: '$75 to $2,000.',
      subheadline: 'Full branding. No hidden fees. Same-day delivery.',
      ctaLabel: 'See Packages',
      accentColor: 'amber-400',
    },
    intakePath: 'wizard',
    pricingFirst: true,
    trustSignal: 'guarantee',
    theme: 'paper-warm',
  },
  d: {
    id: 'd',
    name: 'Local + Minimal',
    hero: {
      headline: 'Florida\'s Creative Studio.',
      subheadline: 'Brevard County. Built with heart. Trusted by entrepreneurs.',
      ctaLabel: 'Start Your Brand',
      accentColor: 'emerald-400',
    },
    intakePath: 'shuffle',
    pricingFirst: false,
    trustSignal: 'local',
    theme: 'glass-frost',
  },
};

const STORAGE_KEY = 'xela_variant';
const ANALYTICS_KEY = 'xela_variant_analytics';

/**
 * Get the active variant for this visitor
 */
export function getActiveVariant(): SiteVariant {
  // 1. URL param wins
  try {
    const params = new URLSearchParams(window.location.search);
    const urlVariant = params.get('v');
    if (urlVariant && ['a', 'b', 'c', 'd'].includes(urlVariant)) {
      localStorage.setItem(STORAGE_KEY, urlVariant);
      trackVariantView(urlVariant as SiteVariant);
      return urlVariant as SiteVariant;
    }
  } catch {}

  // 2. localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['a', 'b', 'c', 'd'].includes(saved)) {
      return saved as SiteVariant;
    }
  } catch {}

  // 3. Random assignment
  const variants: SiteVariant[] = ['a', 'b', 'c', 'd'];
  const picked = variants[Math.floor(Math.random() * variants.length)];
  try {
    localStorage.setItem(STORAGE_KEY, picked);
  } catch {}
  trackVariantView(picked);
  return picked;
}

/**
 * Get the config for the active variant
 */
export function getActiveVariantConfig(): VariantConfig {
  return VARIANTS[getActiveVariant()];
}

/**
 * Track a conversion for the active variant
 */
export function trackVariantConversion(action: 'intake_started' | 'intake_completed' | 'pricing_viewed' | 'contact_submitted'): void {
  try {
    const variant = getActiveVariant();
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const analytics = raw ? JSON.parse(raw) : {};
    if (!analytics[variant]) analytics[variant] = { views: 0, actions: {} };
    if (!analytics[variant].actions[action]) analytics[variant].actions[action] = 0;
    analytics[variant].actions[action]++;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch {}
}

function trackVariantView(variant: SiteVariant): void {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const analytics = raw ? JSON.parse(raw) : {};
    if (!analytics[variant]) analytics[variant] = { views: 0, actions: {} };
    analytics[variant].views++;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch {}
}

/**
 * Get variant analytics for the dashboard
 */
export function getVariantAnalytics(): Record<SiteVariant, { views: number; actions: Record<string, number> }> {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : ({} as Record<SiteVariant, { views: number; actions: Record<string, number> }>);
  } catch {
    return {} as Record<SiteVariant, { views: number; actions: Record<string, number> }>;
  }
}
