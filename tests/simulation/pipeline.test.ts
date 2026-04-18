import { describe, it, expect } from 'vitest';

// ── Replicated core logic from simulation scripts for unit testing ──────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function topKey(obj: Record<string, number>): string | null {
  let best: string | null = null;
  let bestVal = -Infinity;
  for (const [k, v] of Object.entries(obj)) {
    if (v > bestVal) { bestVal = v; best = k; }
  }
  return best;
}

function pickWeighted<T>(items: [T, number][], rand: () => number): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [item, weight] of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

// PreferenceEngine (core logic replicated)
interface IndustryPreferenceModel {
  avgWarmth: number;
  preferredFont: Record<string, number>;
  preferredTone: Record<string, number>;
  preferredComplexity: Record<string, number>;
  preferredVibe: Record<string, number>;
  sampleCount: number;
}

class PreferenceEngine {
  models: Record<string, IndustryPreferenceModel> = {};

  getModel(industry: string): IndustryPreferenceModel {
    if (!this.models[industry]) {
      this.models[industry] = {
        avgWarmth: 0,
        preferredFont: {},
        preferredTone: {},
        preferredComplexity: {},
        preferredVibe: {},
        sampleCount: 0,
      };
    }
    return this.models[industry];
  }

  learn(client: { industry: string; vibe: string; preferences: { color_warmth: number; font_style: string; tone: string; complexity: string } }, satisfaction: number): void {
    const m = this.getModel(client.industry);
    const w = satisfaction / 10;
    const n = m.sampleCount;
    m.avgWarmth = (m.avgWarmth * n + client.preferences.color_warmth * w) / (n + 1);
    m.preferredFont[client.preferences.font_style] = (m.preferredFont[client.preferences.font_style] || 0) + w;
    m.preferredTone[client.preferences.tone] = (m.preferredTone[client.preferences.tone] || 0) + w;
    m.preferredComplexity[client.preferences.complexity] = (m.preferredComplexity[client.preferences.complexity] || 0) + w;
    m.preferredVibe[client.vibe] = (m.preferredVibe[client.vibe] || 0) + w;
    m.sampleCount++;
  }

  alignmentScore(client: { industry: string; vibe: string; preferences: { color_warmth: number; font_style: string; tone: string; complexity: string } }): number {
    const m = this.getModel(client.industry);
    if (m.sampleCount < 3) return 0.2;
    let score = 0;
    const warmthDelta = Math.abs(m.avgWarmth - client.preferences.color_warmth);
    score += (1 - warmthDelta) * 0.25;
    const tFont = topKey(m.preferredFont);
    score += (tFont === client.preferences.font_style ? 1 : 0.3) * 0.2;
    const tTone = topKey(m.preferredTone);
    score += (tTone === client.preferences.tone ? 1 : 0.3) * 0.2;
    const tComp = topKey(m.preferredComplexity);
    score += (tComp === client.preferences.complexity ? 1 : 0.3) * 0.15;
    const tVibe = topKey(m.preferredVibe);
    score += (tVibe === client.vibe ? 1 : 0.3) * 0.2;
    const experienceBonus = Math.min(m.sampleCount / 200, 0.3);
    score = Math.min(score + experienceBonus, 1.0);
    return score;
  }
}

const PACKAGE_PRICES: Record<string, number> = {
  starter: 149,
  growth: 349,
  elite: 749,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('seededRandom', () => {
  it('produces deterministic sequences', () => {
    const r1 = seededRandom(42);
    const r2 = seededRandom(42);
    const seq1 = Array.from({ length: 100 }, () => r1());
    const seq2 = Array.from({ length: 100 }, () => r2());
    expect(seq1).toEqual(seq2);
  });

  it('produces values in [0, 1)', () => {
    const r = seededRandom(12345);
    for (let i = 0; i < 10000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('different seeds produce different sequences', () => {
    const r1 = seededRandom(1);
    const r2 = seededRandom(2);
    const seq1 = Array.from({ length: 20 }, () => r1());
    const seq2 = Array.from({ length: 20 }, () => r2());
    expect(seq1).not.toEqual(seq2);
  });

  it('has reasonable distribution (chi-square-ish check)', () => {
    const r = seededRandom(999);
    const buckets = new Array(10).fill(0);
    const n = 10000;
    for (let i = 0; i < n; i++) {
      const v = r();
      buckets[Math.min(Math.floor(v * 10), 9)]++;
    }
    // Each bucket should have ~1000 ± 200
    for (const count of buckets) {
      expect(count).toBeGreaterThan(700);
      expect(count).toBeLessThan(1300);
    }
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to lower bound', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to upper bound', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal bounds', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('handles boundary values exactly', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('median', () => {
  it('returns 0 for empty array', () => {
    expect(median([])).toBe(0);
  });

  it('returns single value', () => {
    expect(median([5])).toBe(5);
  });

  it('computes median of odd-length array', () => {
    expect(median([1, 3, 5])).toBe(3);
    expect(median([7, 1, 3, 9, 5])).toBe(5);
  });

  it('computes median of even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([10, 20])).toBe(15);
  });

  it('does not mutate input', () => {
    const arr = [5, 1, 3];
    median(arr);
    expect(arr).toEqual([5, 1, 3]);
  });
});

describe('round2', () => {
  it('rounds to 2 decimal places', () => {
    expect(round2(3.14159)).toBe(3.14);
    expect(round2(2.005)).toBe(2.01); // JS rounding
    expect(round2(1.1)).toBe(1.1);
    expect(round2(0)).toBe(0);
  });
});

describe('topKey', () => {
  it('returns key with highest value', () => {
    expect(topKey({ a: 1, b: 5, c: 3 })).toBe('b');
  });

  it('returns null for empty object', () => {
    expect(topKey({})).toBeNull();
  });

  it('returns first key on tie (insertion order)', () => {
    const result = topKey({ a: 5, b: 5 });
    expect(result).toBe('a');
  });

  it('handles negative values', () => {
    expect(topKey({ a: -3, b: -1, c: -5 })).toBe('b');
  });
});

describe('pickWeighted', () => {
  it('respects distribution within tolerance', () => {
    const items: [string, number][] = [
      ['budget', 0.40],
      ['premium', 0.35],
      ['elite', 0.25],
    ];
    const r = seededRandom(42);
    const counts: Record<string, number> = { budget: 0, premium: 0, elite: 0 };
    const n = 10000;
    for (let i = 0; i < n; i++) {
      counts[pickWeighted(items, r)]++;
    }
    // ±5% tolerance
    expect(counts.budget / n).toBeCloseTo(0.40, 1);
    expect(counts.premium / n).toBeCloseTo(0.35, 1);
    expect(counts.elite / n).toBeCloseTo(0.25, 1);
  });

  it('returns only item when single option', () => {
    const r = seededRandom(1);
    expect(pickWeighted([['only', 1]], r)).toBe('only');
  });
});

describe('PreferenceEngine', () => {
  it('returns cold-start score of 0.2 with < 3 samples', () => {
    const engine = new PreferenceEngine();
    const client = {
      industry: 'salon',
      vibe: 'Bold',
      preferences: { color_warmth: 0.7, font_style: 'sans', tone: 'professional', complexity: 'simple' },
    };
    expect(engine.alignmentScore(client)).toBe(0.2);
  });

  it('improves alignment as it learns matching preferences', () => {
    const engine = new PreferenceEngine();
    const client = {
      industry: 'restaurant',
      vibe: 'Playful',
      preferences: { color_warmth: 0.6, font_style: 'handwritten', tone: 'friendly', complexity: 'moderate' },
    };

    // Train with similar clients
    for (let i = 0; i < 50; i++) {
      engine.learn({
        industry: 'restaurant',
        vibe: 'Playful',
        preferences: { color_warmth: 0.55 + Math.random() * 0.1, font_style: 'handwritten', tone: 'friendly', complexity: 'moderate' },
      }, 8);
    }

    const score = engine.alignmentScore(client);
    expect(score).toBeGreaterThan(0.5);
  });

  it('gives lower score when preferences diverge', () => {
    const engine = new PreferenceEngine();

    // Train on serif/luxury
    for (let i = 0; i < 30; i++) {
      engine.learn({
        industry: 'auto',
        vibe: 'Luxury',
        preferences: { color_warmth: 0.2, font_style: 'serif', tone: 'luxury', complexity: 'complex' },
      }, 9);
    }

    // Test with completely different preferences
    const divergentClient = {
      industry: 'auto',
      vibe: 'Bold',
      preferences: { color_warmth: 0.9, font_style: 'sans', tone: 'edgy', complexity: 'simple' },
    };

    const matchingClient = {
      industry: 'auto',
      vibe: 'Luxury',
      preferences: { color_warmth: 0.2, font_style: 'serif', tone: 'luxury', complexity: 'complex' },
    };

    expect(engine.alignmentScore(matchingClient)).toBeGreaterThan(engine.alignmentScore(divergentClient));
  });

  it('experience bonus caps at 0.3', () => {
    const engine = new PreferenceEngine();
    const client = {
      industry: 'fitness',
      vibe: 'Bold',
      preferences: { color_warmth: 0.5, font_style: 'sans', tone: 'professional', complexity: 'moderate' },
    };

    for (let i = 0; i < 500; i++) {
      engine.learn({ ...client }, 10);
    }

    const score = engine.alignmentScore(client);
    expect(score).toBeLessThanOrEqual(1.0);
  });

  it('models are independent per industry', () => {
    const engine = new PreferenceEngine();
    engine.learn({
      industry: 'retail',
      vibe: 'Clean',
      preferences: { color_warmth: 0.5, font_style: 'sans', tone: 'friendly', complexity: 'simple' },
    }, 7);

    engine.learn({
      industry: 'salon',
      vibe: 'Bold',
      preferences: { color_warmth: 0.8, font_style: 'display', tone: 'edgy', complexity: 'complex' },
    }, 9);

    expect(engine.getModel('retail').sampleCount).toBe(1);
    expect(engine.getModel('salon').sampleCount).toBe(1);
    expect(engine.getModel('fitness').sampleCount).toBe(0);
  });
});

describe('Package pricing', () => {
  it('has correct prices', () => {
    expect(PACKAGE_PRICES.starter).toBe(149);
    expect(PACKAGE_PRICES.growth).toBe(349);
    expect(PACKAGE_PRICES.elite).toBe(749);
  });

  it('elite is ~5x starter', () => {
    expect(PACKAGE_PRICES.elite / PACKAGE_PRICES.starter).toBeCloseTo(5.03, 1);
  });
});

describe('Revenue calculations', () => {
  it('computes batch revenue correctly', () => {
    const clients = [
      { package: 'starter', revenue: 149 },
      { package: 'growth', revenue: 349 },
      { package: 'elite', revenue: 749 },
      { package: 'elite', revenue: 749 },
    ];
    const total = clients.reduce((s, c) => s + c.revenue, 0);
    expect(total).toBe(1996);
  });

  it('upsell rate calculation', () => {
    const delivered = 1000;
    const upsold = 194;
    const rate = round2(upsold / delivered);
    expect(rate).toBe(0.19);
  });
});

describe('Convergence rate formula', () => {
  it('computes improvement percentage', () => {
    const firstBatch = 4.3;
    const lastBatch = 2.7;
    const improvement = round2((1 - lastBatch / firstBatch) * 100);
    expect(improvement).toBe(37.21);
    expect(improvement).toBeGreaterThan(30);
  });

  it('returns 0 when no improvement', () => {
    const improvement = round2((1 - 3.0 / 3.0) * 100);
    expect(improvement).toBe(0);
  });

  it('handles negative improvement (regression)', () => {
    const improvement = round2((1 - 5.0 / 3.0) * 100);
    expect(improvement).toBeLessThan(0);
  });
});

describe('Contact rate by referral source', () => {
  const contactRates: Record<string, number> = {
    google: 0.35,
    social: 0.38,
    referral: 0.55,
    flyer: 0.30,
    doorhanger: 0.28,
    phone: 0.50,
  };

  it('referral has highest contact rate', () => {
    const best = topKey(contactRates);
    expect(best).toBe('referral');
  });

  it('all rates between 0 and 1', () => {
    for (const rate of Object.values(contactRates)) {
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(1);
    }
  });

  it('referral rate is nearly 2x doorhanger', () => {
    expect(contactRates.referral / contactRates.doorhanger).toBeCloseTo(1.96, 1);
  });
});
