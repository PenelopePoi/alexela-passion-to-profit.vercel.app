/**
 * XELA Creative Branding Studio — Synthetic Client Generator
 * Generates 20,000 diverse client profiles for pipeline simulation
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Personality {
  decisiveness: number;
  pickiness: number;
  budget_sensitivity: number;
  design_literacy: number;
}

interface Preferences {
  color_warmth: number;
  font_style: string;
  tone: string;
  complexity: string;
}

interface SyntheticClient {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  location: string;
  vibe: string;
  budget: string;
  services: string[];
  yearsExperience: string;
  referralSource: string;
  personality: Personality;
  preferences: Preferences;
}

// ── Seed Data ──────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Maria', 'Jose', 'James', 'Jennifer', 'Robert', 'Jessica', 'Michael', 'Ashley',
  'David', 'Stephanie', 'Carlos', 'Amanda', 'Juan', 'Nicole', 'Luis', 'Brittany',
  'Jorge', 'Samantha', 'Miguel', 'Megan', 'Angel', 'Heather', 'Pedro', 'Rachel',
  'Alejandro', 'Lauren', 'Raul', 'Tiffany', 'Fernando', 'Kayla', 'Ricardo', 'Crystal',
  'Antonio', 'Vanessa', 'Eduardo', 'Brenda', 'Hector', 'Yolanda', 'Rafael', 'Patricia',
  'Marco', 'Latoya', 'Deshawn', 'Keisha', 'Terrell', 'Shanice', 'Jamal', 'Aaliyah',
  'Tyrone', 'Ebony', 'DeAndre', 'Tamika', 'William', 'Sarah', 'Christopher', 'Elizabeth',
  'Daniel', 'Michelle', 'Anthony', 'Kimberly', 'Travis', 'Amber', 'Brandon', 'Andrea',
  'Tyler', 'Christina', 'Kevin', 'Melissa', 'Jason', 'Lisa', 'Ryan', 'Rebecca',
  'Brian', 'Laura', 'Cody', 'Angela', 'Derek', 'Danielle', 'Eric', 'Catherine',
];

const LAST_NAMES = [
  'Rodriguez', 'Garcia', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill',
  'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres',
  'Parker', 'Collins', 'Edwards', 'Stewart', 'Flores', 'Morris', 'Rivera', 'Cook',
  'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez',
  'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson',
  'Brooks', 'Bennett', 'Gray', 'James', 'Reyes', 'Cruz', 'Hughes', 'Price',
];

const INDUSTRIES: [string, number][] = [
  ['restaurant', 0.15],
  ['contractor', 0.12],
  ['salon', 0.10],
  ['retail', 0.08],
  ['fitness', 0.06],
  ['auto', 0.06],
  ['real_estate', 0.06],
  ['cleaning', 0.05],
  ['photography', 0.04],
  ['landscaping', 0.04],
  ['food_truck', 0.04],
  ['mobile_detailing', 0.03],
  ['tutoring', 0.03],
  ['pet_grooming', 0.03],
  ['nail_tech', 0.03],
  ['barber', 0.03],
  ['catering', 0.02],
  ['pressure_washing', 0.02],
  ['pool_service', 0.02],
  ['handyman', 0.02],
];

const INDUSTRY_BUSINESS_TEMPLATES: Record<string, string[]> = {
  restaurant: ['{L} Kitchen', '{L} Grill & Bar', 'Taste of {C}', '{F}\'s Cafe', 'The {L} Table', '{C} Eats', 'Island Flavor {L}', '{L} Smokehouse'],
  contractor: ['{L} Construction', '{L} & Sons Builders', '{C} Home Pros', 'Elite {L} Contracting', '{F} Built Right', 'SpaceCraft Builds', '{L} Renovations'],
  salon: ['{F}\'s Beauty Bar', 'Glow Up by {F}', '{C} Styles', 'Luxe Salon {C}', 'The {L} Look', 'Bella {F} Studio', 'Radiance by {F}'],
  retail: ['{L} Boutique', '{C} Market', '{F}\'s Treasures', 'The {L} Shop', 'Coastal Finds {C}', '{L} & Co.', 'Space Coast Goods'],
  fitness: ['{L} Fitness', '{F}\'s Gym', '{C} CrossFit', 'Iron {L}', 'FitLife {C}', '{L} Performance', 'Brevard Strong'],
  auto: ['{L} Auto Care', '{C} Motors', '{F}\'s Garage', '{L} Collision', 'SpeedZone {L}', '{C} Auto Repair', '{L} Tire & Lube'],
  real_estate: ['{L} Realty Group', '{F} {L} Homes', '{C} Property Co.', 'Coastal Living Realty', '{L} & Associates', 'Brevard Home Team'],
  cleaning: ['{L} Clean Co.', 'Sparkle {C}', '{F}\'s Cleaning', 'Pristine by {F}', '{C} Maids', 'Fresh Start {L}', 'SpotlessSpace {C}'],
  photography: ['{F} {L} Photography', 'Captured by {F}', '{C} Lens Studio', '{L} Visuals', 'Shutter & Soul {C}', '{F} Frames'],
  landscaping: ['{L} Landscaping', 'Green Thumb {C}', '{F}\'s Lawn Care', '{C} Outdoor Living', '{L} Grounds', 'Coastal Green {L}'],
  food_truck: ['{L}\'s Rolling Kitchen', '{F}\'s Grub Hub', 'Street Eats {C}', 'The {L} Truck', 'Roaming {L}', 'Curbside {F}'],
  mobile_detailing: ['{L} Detail Co.', 'Shine On {C}', '{F}\'s Mobile Detail', 'Mirror Finish {L}', '{C} Auto Spa', 'Gleam by {F}'],
  tutoring: ['{F} {L} Tutoring', '{C} Learning Lab', 'BrainBoost by {F}', 'A+ {L} Academy', '{L} Scholars', 'Level Up {C}'],
  pet_grooming: ['{F}\'s Paw Spa', 'Happy Tails {C}', '{L} Pet Parlor', 'Bark & Bath {C}', 'Fluffy {L}', 'Pampered Paws by {F}'],
  nail_tech: ['Nails by {F}', '{F}\'s Nail Bar', 'Polished {C}', 'Tip Top {L}', '{C} Nails & Spa', 'Luxe Nails by {F}'],
  barber: ['{L}\'s Barbershop', 'Fresh Cuts {C}', 'The {L} Chair', '{F}\'s Fades', 'Clean Edge {L}', 'Brevard Barber Co.'],
  catering: ['{L} Catering', 'Savory Events by {F}', '{C} Catering Co.', 'Feast {L}', '{F}\'s Table Catering', 'Coastal Bites {C}'],
  pressure_washing: ['{L} Pressure Wash', 'BlastClean {C}', '{F}\'s Power Wash', '{C} Surface Pros', 'Spray & Shine {L}', 'Hydro {L}'],
  pool_service: ['{L} Pool Care', 'Crystal Clear {C}', '{F}\'s Pool Service', '{C} Aqua Pros', 'Blue Wave {L}', 'Splash {L}'],
  handyman: ['{L} Handyman', '{F}\'s Fix-It', '{C} Home Repair', 'Mr. {L} Repairs', 'ToolBox {L}', '{F} Can Fix It'],
};

const LOCATIONS: [string, number][] = [
  ['Melbourne', 0.20],
  ['Palm Bay', 0.18],
  ['Titusville', 0.10],
  ['Cocoa', 0.09],
  ['Rockledge', 0.08],
  ['Merritt Island', 0.08],
  ['Cocoa Beach', 0.06],
  ['Satellite Beach', 0.04],
  ['Indialantic', 0.03],
  ['Melbourne Beach', 0.03],
  ['West Melbourne', 0.04],
  ['Viera', 0.04],
  ['Mims', 0.02],
  ['Cape Canaveral', 0.01],
];

const VIBES = ['Bold', 'Clean', 'Warm', 'Luxury', 'Playful'];
const BUDGETS: [string, number][] = [['budget', 0.40], ['premium', 0.35], ['elite', 0.25]];
const REFERRAL_SOURCES: [string, number][] = [
  ['google', 0.30], ['social', 0.25], ['referral', 0.18],
  ['flyer', 0.12], ['doorhanger', 0.08], ['phone', 0.07],
];
const FONT_STYLES = ['serif', 'sans', 'display', 'handwritten'];
const TONES = ['professional', 'friendly', 'edgy', 'luxury', 'playful'];
const COMPLEXITIES = ['minimal', 'moderate', 'detailed'];

const INDUSTRY_SERVICES: Record<string, string[]> = {
  restaurant: ['dine-in', 'takeout', 'delivery', 'catering', 'private events', 'brunch', 'happy hour'],
  contractor: ['remodeling', 'roofing', 'flooring', 'bathroom reno', 'kitchen reno', 'additions', 'drywall', 'painting'],
  salon: ['haircuts', 'color', 'blowouts', 'extensions', 'keratin treatment', 'bridal styling', 'updos'],
  retail: ['clothing', 'accessories', 'home decor', 'gifts', 'vintage finds', 'custom orders', 'shipping'],
  fitness: ['personal training', 'group classes', 'HIIT', 'yoga', 'strength training', 'nutrition coaching', 'bootcamp'],
  auto: ['oil change', 'brake repair', 'tire rotation', 'AC repair', 'engine diagnostics', 'body work', 'detailing'],
  real_estate: ['buying', 'selling', 'property management', 'investment', 'first-time buyer', 'luxury homes', 'commercial'],
  cleaning: ['residential cleaning', 'deep cleaning', 'move-in/out', 'office cleaning', 'post-construction', 'window cleaning'],
  photography: ['portraits', 'events', 'weddings', 'product photography', 'headshots', 'real estate photos', 'family sessions'],
  landscaping: ['lawn mowing', 'garden design', 'tree trimming', 'irrigation', 'sod installation', 'mulching', 'hardscaping'],
  food_truck: ['lunch service', 'events', 'festivals', 'corporate catering', 'private parties', 'late night'],
  mobile_detailing: ['exterior wash', 'interior detail', 'paint correction', 'ceramic coating', 'headlight restoration', 'engine bay'],
  tutoring: ['math', 'reading', 'SAT prep', 'science', 'ESL', 'homework help', 'college prep'],
  pet_grooming: ['bath & brush', 'full groom', 'nail trim', 'teeth cleaning', 'de-shedding', 'puppy first groom'],
  nail_tech: ['manicure', 'pedicure', 'gel nails', 'acrylics', 'nail art', 'dip powder', 'fill-ins'],
  barber: ['haircut', 'beard trim', 'hot towel shave', 'lineup', 'kids cut', 'fade', 'scalp treatment'],
  catering: ['weddings', 'corporate events', 'private parties', 'holiday meals', 'buffet service', 'plated dinner'],
  pressure_washing: ['driveway', 'sidewalk', 'house exterior', 'roof cleaning', 'deck/patio', 'commercial', 'fence cleaning'],
  pool_service: ['weekly maintenance', 'chemical balancing', 'equipment repair', 'pool resurfacing', 'leak detection', 'green-to-clean'],
  handyman: ['plumbing', 'electrical', 'drywall', 'door/window install', 'furniture assembly', 'TV mounting', 'gutter cleaning'],
};

// ── Utility Functions ──────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickWeighted<T>(items: [T, number][]): T {
  const r = rand();
  let cumulative = 0;
  for (const [item, weight] of items) {
    cumulative += weight;
    if (r <= cumulative) return item;
  }
  return items[items.length - 1][0];
}

function pickMultiple<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(rand() * (max - min + 1));
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function gaussianish(): number {
  // Box-Muller-esque from uniform
  return (rand() + rand() + rand()) / 3;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function roundTo(v: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

// ── Generator ──────────────────────────────────────────────────────────────────

function generateClient(index: number): SyntheticClient {
  const id = `sim-${String(index + 1).padStart(5, '0')}`;
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const industry = pickWeighted(INDUSTRIES);
  const location = pickWeighted(LOCATIONS);
  const budget = pickWeighted(BUDGETS);

  // Generate business name from templates
  const templates = INDUSTRY_BUSINESS_TEMPLATES[industry] || ['{L} Business'];
  let businessName = pick(templates)
    .replace('{F}', firstName)
    .replace('{L}', lastName)
    .replace('{C}', location);

  const vibe = pick(VIBES);
  const services = pickMultiple(INDUSTRY_SERVICES[industry] || ['general service'], 2, 5);

  const yearsRaw = Math.floor(rand() * 20) + 1;
  const yearsExperience = yearsRaw <= 2 ? 'new' : yearsRaw <= 5 ? '2-5' : yearsRaw <= 10 ? '5-10' : '10+';

  const referralSource = pickWeighted(REFERRAL_SOURCES);

  // Personality — correlated with budget tier
  const budgetBase = budget === 'elite' ? 7 : budget === 'premium' ? 5 : 3;
  const personality: Personality = {
    decisiveness: clamp(Math.round(budgetBase + (rand() - 0.5) * 6), 1, 10),
    pickiness: clamp(Math.round((11 - budgetBase) + (rand() - 0.5) * 6), 1, 10),
    budget_sensitivity: clamp(Math.round((11 - budgetBase) + (rand() - 0.5) * 4), 1, 10),
    design_literacy: clamp(Math.round(gaussianish() * 10), 1, 10),
  };

  // Preferences — correlated with industry and vibe
  const warmthMap: Record<string, number> = {
    restaurant: 0.4, salon: 0.3, contractor: -0.2, retail: 0.1, fitness: -0.1,
    auto: -0.3, real_estate: 0.1, cleaning: 0, photography: 0.2, landscaping: 0.1,
    food_truck: 0.3, mobile_detailing: -0.2, tutoring: 0.2, pet_grooming: 0.3,
    nail_tech: 0.4, barber: -0.1, catering: 0.3, pressure_washing: -0.2,
    pool_service: -0.1, handyman: -0.2,
  };

  const preferences: Preferences = {
    color_warmth: roundTo(clamp((warmthMap[industry] || 0) + (rand() - 0.5) * 0.8, -1, 1), 2),
    font_style: pick(FONT_STYLES),
    tone: pick(TONES),
    complexity: pick(COMPLEXITIES),
  };

  return {
    id, name, businessName, industry, location, vibe, budget,
    services, yearsExperience, referralSource, personality, preferences,
  };
}

// ── Main ───────────────────────────────────────────────────────────────────────

const TOTAL_CLIENTS = 20_000;

console.log(`Generating ${TOTAL_CLIENTS.toLocaleString()} synthetic clients...`);

const clients: SyntheticClient[] = [];
for (let i = 0; i < TOTAL_CLIENTS; i++) {
  clients.push(generateClient(i));
  if ((i + 1) % 5000 === 0) {
    console.log(`  ${i + 1} clients generated`);
  }
}

const outDir = join(import.meta.dirname!, '..', '..', 'output', 'simulation');
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, 'synthetic-clients.json');
writeFileSync(outPath, JSON.stringify(clients, null, 2));

console.log(`Wrote ${clients.length.toLocaleString()} clients to ${outPath}`);

// Quick stats
const budgetDist = { budget: 0, premium: 0, elite: 0 };
const industryDist: Record<string, number> = {};
const locationDist: Record<string, number> = {};
for (const c of clients) {
  budgetDist[c.budget as keyof typeof budgetDist]++;
  industryDist[c.industry] = (industryDist[c.industry] || 0) + 1;
  locationDist[c.location] = (locationDist[c.location] || 0) + 1;
}

console.log('\nBudget Distribution:');
for (const [k, v] of Object.entries(budgetDist)) {
  console.log(`  ${k}: ${v} (${((v / TOTAL_CLIENTS) * 100).toFixed(1)}%)`);
}

console.log('\nTop 5 Industries:');
const sortedIndustries = Object.entries(industryDist).sort((a, b) => b[1] - a[1]).slice(0, 5);
for (const [k, v] of sortedIndustries) {
  console.log(`  ${k}: ${v} (${((v / TOTAL_CLIENTS) * 100).toFixed(1)}%)`);
}

console.log('\nTop 5 Locations:');
const sortedLocations = Object.entries(locationDist).sort((a, b) => b[1] - a[1]).slice(0, 5);
for (const [k, v] of sortedLocations) {
  console.log(`  ${k}: ${v} (${((v / TOTAL_CLIENTS) * 100).toFixed(1)}%)`);
}
