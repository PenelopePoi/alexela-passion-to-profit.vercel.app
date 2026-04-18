/**
 * Client Profile Service
 * Stores and retrieves XELA-hosted client mini-profiles.
 * Each $75 CardCut client gets a free profile page at /p/{slug}
 */

export interface ClientProfile {
  id: string;
  slug: string; // URL-safe identifier (e.g., "joes-lawn-care")
  businessName: string;
  ownerName: string;
  phone: string;
  email?: string;
  location: string; // City, State
  industry?: string;
  tagline?: string;
  services: string[]; // bullet list
  hours?: string; // "Mon-Fri 8a-6p · Sat 9a-2p"
  photoUrl?: string; // optional logo or owner photo
  accentColor?: string; // hex color (default brand-teal)
  vibe?: 'modern' | 'bold' | 'luxury' | 'friendly' | 'eco' | 'gothic';
  facebook?: string;
  instagram?: string;
  googleBusinessUrl?: string;
  websiteUrl?: string;
  createdAt: number;
  updatedAt: number;
  views: number;
  callClicks: number;
}

const STORAGE_KEY = 'xela_client_profiles';

function loadProfiles(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: ClientProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {}
}

export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function createProfile(data: Omit<ClientProfile, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'views' | 'callClicks'>): ClientProfile {
  const profiles = loadProfiles();
  let baseSlug = generateSlug(data.businessName);
  let slug = baseSlug;
  let suffix = 1;
  while (profiles.some(p => p.slug === slug)) {
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }
  const profile: ClientProfile = {
    ...data,
    id: `prof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    slug,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    views: 0,
    callClicks: 0,
  };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function getProfileBySlug(slug: string): ClientProfile | null {
  return loadProfiles().find(p => p.slug === slug) || null;
}

export function getAllProfiles(): ClientProfile[] {
  return loadProfiles();
}

export function updateProfile(id: string, updates: Partial<ClientProfile>): ClientProfile | null {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx < 0) return null;
  profiles[idx] = { ...profiles[idx], ...updates, updatedAt: Date.now() };
  saveProfiles(profiles);
  return profiles[idx];
}

export function deleteProfile(id: string): boolean {
  const profiles = loadProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  if (filtered.length === profiles.length) return false;
  saveProfiles(filtered);
  return true;
}

export function trackProfileView(slug: string): void {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.slug === slug);
  if (idx >= 0) {
    profiles[idx].views++;
    saveProfiles(profiles);
  }
}

export function trackCallClick(slug: string): void {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.slug === slug);
  if (idx >= 0) {
    profiles[idx].callClicks++;
    saveProfiles(profiles);
  }
}

export function buildProfileUrl(slug: string, baseUrl: string = 'https://xela-elite-ai-creative-studio.vercel.app'): string {
  return `${baseUrl}/?p=${encodeURIComponent(slug)}`;
}
