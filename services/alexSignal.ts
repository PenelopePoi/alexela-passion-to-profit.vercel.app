/**
 * Alex Signal Service
 * Allows Alex to mark clients as quick/deep while filling out forms
 */

export type ClientDepth = 'quick' | 'deep' | null;

const SIGNAL_KEY = 'xela_alex_signal';
const ALEX_MODE_KEY = 'xela_alex_mode';

export function isAlexMode(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('alex') === 'true') {
      localStorage.setItem(ALEX_MODE_KEY, 'true');
      return true;
    }
    return localStorage.getItem(ALEX_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAlexMode(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(ALEX_MODE_KEY, 'true');
    else localStorage.removeItem(ALEX_MODE_KEY);
  } catch {}
}

export function getCurrentDepth(): ClientDepth {
  try {
    const saved = localStorage.getItem(SIGNAL_KEY);
    if (saved === 'quick' || saved === 'deep') return saved;
  } catch {}
  return null;
}

export function setCurrentDepth(depth: ClientDepth): void {
  try {
    if (depth) localStorage.setItem(SIGNAL_KEY, depth);
    else localStorage.removeItem(SIGNAL_KEY);
  } catch {}
}

/**
 * Quick price estimates for common service combinations
 * Based on XELA's real pricing tiers
 */
export function getQuickPriceEstimate(services: string[] = []): { low: number; high: number; label: string } {
  const count = services.length;
  if (count === 0) return { low: 75, high: 175, label: 'Starter' };
  if (count <= 2) return { low: 125, high: 275, label: 'Basic' };
  if (count <= 4) return { low: 350, high: 500, label: 'Standard' };
  if (count <= 6) return { low: 500, high: 850, label: 'Premium' };
  if (count <= 8) return { low: 850, high: 1200, label: 'Elite' };
  return { low: 1200, high: 2000, label: 'Ultimate' };
}

/**
 * Deep price breakdown — itemized
 */
export function getDeepPriceBreakdown(services: string[] = []): Array<{ item: string; price: number }> {
  const priceMap: Record<string, number> = {
    'logo': 125,
    'color palette': 50,
    'brand guidelines': 150,
    'business cards': 75,
    'social media kit': 125,
    'flyer': 75,
    'ad copy': 100,
    'email templates': 100,
    'landing page': 350,
    'seo setup': 200,
    'google business': 99,
    'stickers': 75,
    'door hangers': 50,
    'banners': 125,
    'vehicle wrap': 250,
  };

  return services
    .map(s => {
      const key = Object.keys(priceMap).find(k => s.toLowerCase().includes(k));
      return key ? { item: s, price: priceMap[key] } : { item: s, price: 100 };
    });
}
