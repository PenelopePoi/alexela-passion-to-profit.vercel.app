
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket, RefreshCw, Megaphone, Compass, Search, ChevronLeft, ChevronRight,
  Check, X, Phone, Mail, MessageSquare, Sun, Clock, Moon, Sparkles,
  ArrowRight, Star, Shield, Zap, Heart, Leaf, Skull, PartyPopper,
} from 'lucide-react';
import { logSubmission, rateLimitOk } from '../services/submissionLog';

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

export interface ConsultationData {
  goal: string;
  vibe: string;
  industry: string;
  companyName: string;
  ownerName: string;
  location: string;
  yearsInBusiness: number;
  selectedItems: string[];
  totalPrice: number;
  suggestedTier: 'budget' | 'premium' | 'elite' | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  preferredContact: Array<'call' | 'text' | 'email'>;
  bestTime: 'morning' | 'afternoon' | 'evening';
  additionalNotes: string;
}

export interface ConsultationWizardProps {
  onComplete?: (data: ConsultationData) => void;
  onSelectPackage?: (tier: 'budget' | 'premium' | 'elite') => void;
  /** Called when the user clicks "Get Started" on the final step to begin intake */
  onGetStarted?: (tier: 'budget' | 'premium' | 'elite') => void;
}

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

const STORAGE_KEY = 'xela_consultation_draft';
const TOTAL_STEPS = 8;

const GOALS = [
  { id: 'new-business', label: 'Starting a New Business', Icon: Rocket, desc: 'Build your brand from scratch' },
  { id: 'rebrand', label: 'Rebranding / Refresh', Icon: RefreshCw, desc: 'Modernize your current look' },
  { id: 'marketing', label: 'Need Marketing Materials', Icon: Megaphone, desc: 'Flyers, cards, social & more' },
  { id: 'exploring', label: 'Just Exploring', Icon: Compass, desc: 'See what we can do for you' },
];

const VIBES = [
  { id: 'modern', label: 'Modern & Minimalist', gradient: 'from-gray-100 to-white', palette: ['#F5F5F5','#222222','#00E0C6','#DDDDDD'], Icon: Star },
  { id: 'bold', label: 'Bold & Energetic', gradient: 'from-orange-400 to-red-500', palette: ['#FF6B35','#D62828','#FCF300','#001524'], Icon: Zap },
  { id: 'luxury', label: 'Luxury & High-End', gradient: 'from-gray-900 to-yellow-700', palette: ['#111111','#C5A55A','#FFFFFF','#2C2C2C'], Icon: Shield },
  { id: 'friendly', label: 'Friendly & Local', gradient: 'from-amber-200 to-orange-300', palette: ['#E8985E','#5B8C5A','#F5E6CC','#3D2B1F'], Icon: Heart },
  { id: 'eco', label: 'Eco & Organic', gradient: 'from-emerald-400 to-green-600', palette: ['#2D6A4F','#95D5B2','#F0EBD8','#081C15'], Icon: Leaf },
  { id: 'gothic', label: 'Dark & Gothic', gradient: 'from-purple-900 to-gray-900', palette: ['#1A0A2E','#7B2D8E','#F5F2ED','#0D0D0D'], Icon: Skull },
];

const INDUSTRIES = [
  'Tattoo Artistry','Photography','Landscaping','Auto Detailing','Barbershop','Hair Salon',
  'Restaurant','Food Truck','Real Estate','Cleaning','Personal Training','Nail Salon',
  'General Contracting','Plumbing','Electrical','HVAC','Pressure Washing','Pool Service',
  'Legal Services','Accounting','Music Production','Graphic Design','Fashion Design',
  'E-Commerce','Consulting','Coaching','Non-Profit','Church/Ministry','Cannabis',
  'Pet Services','Event Planning','Trucking','Other',
];

interface DeliverableItem {
  id: string;
  label: string;
  price: number;
  tier: '$' | '$$' | '$$$';
}

interface DeliverableCategory {
  category: string;
  items: DeliverableItem[];
}

const DELIVERABLES: DeliverableCategory[] = [
  { category: 'Brand Identity', items: [
    { id: 'logo', label: 'Logo', price: 125, tier: '$$' },
    { id: 'color-palette', label: 'Color Palette', price: 50, tier: '$' },
    { id: 'brand-guidelines', label: 'Brand Guidelines', price: 150, tier: '$$' },
    { id: 'business-cards', label: 'Business Cards', price: 75, tier: '$' },
  ]},
  { category: 'Marketing', items: [
    { id: 'social-media-kit', label: 'Social Media Kit', price: 125, tier: '$$' },
    { id: 'flyer', label: 'Flyer Design', price: 75, tier: '$' },
    { id: 'ad-copy', label: 'Ad Copy', price: 100, tier: '$$' },
    { id: 'email-templates', label: 'Email Templates', price: 100, tier: '$$' },
  ]},
  { category: 'Digital', items: [
    { id: 'landing-page', label: 'Landing Page', price: 350, tier: '$$$' },
    { id: 'seo-setup', label: 'SEO Setup', price: 200, tier: '$$' },
    { id: 'google-business', label: 'Google Business Profile', price: 99, tier: '$' },
  ]},
  { category: 'Print', items: [
    { id: 'stickers', label: 'Stickers', price: 75, tier: '$' },
    { id: 'door-hangers', label: 'Door Hangers', price: 50, tier: '$' },
    { id: 'banners', label: 'Banners', price: 125, tier: '$$' },
    { id: 'vehicle-wrap', label: 'Vehicle Wrap Design', price: 250, tier: '$$$' },
  ]},
];

const ALL_ITEMS = DELIVERABLES.flatMap(c => c.items);

const SMART_PRESETS: { label: string; desc: string; items: string[]; industries?: string[] }[] = [
  { label: 'Starter Kit', desc: 'Logo + cards + colors — everything to look legit', items: ['logo','color-palette','business-cards'] },
  { label: 'Marketing Machine', desc: 'Get found, get calls, get paid', items: ['logo','social-media-kit','flyer','google-business','ad-copy'] },
  { label: 'Full Brand Launch', desc: 'Complete identity + marketing + digital', items: ['logo','color-palette','brand-guidelines','business-cards','social-media-kit','flyer','ad-copy','landing-page','seo-setup','google-business'] },
  { label: 'Print Power Pack', desc: 'Physical marketing that gets noticed', items: ['business-cards','stickers','door-hangers','flyer','banners'] },
];

const INDUSTRY_SUGGESTIONS: Record<string, string[]> = {
  'Tattoo Artistry': ['logo','business-cards','social-media-kit','stickers'],
  'Photography': ['logo','landing-page','social-media-kit','brand-guidelines'],
  'Landscaping': ['logo','business-cards','door-hangers','vehicle-wrap','flyer'],
  'Auto Detailing': ['logo','business-cards','flyer','stickers','google-business'],
  'Barbershop': ['logo','business-cards','social-media-kit','flyer','google-business'],
  'Hair Salon': ['logo','business-cards','social-media-kit','flyer','google-business'],
  'Restaurant': ['logo','social-media-kit','flyer','google-business','landing-page'],
  'Food Truck': ['logo','social-media-kit','stickers','vehicle-wrap','flyer'],
  'Real Estate': ['logo','business-cards','landing-page','email-templates','ad-copy'],
  'Cleaning': ['logo','business-cards','door-hangers','flyer','google-business'],
  'Personal Training': ['logo','social-media-kit','landing-page','ad-copy'],
  'General Contracting': ['logo','business-cards','vehicle-wrap','flyer','google-business'],
  'Pressure Washing': ['logo','business-cards','door-hangers','flyer','google-business'],
  'Plumbing': ['logo','business-cards','vehicle-wrap','door-hangers','google-business'],
  'Consulting': ['logo','brand-guidelines','landing-page','email-templates','business-cards'],
};

const YEAR_LABELS: Record<number, string> = {
  0: 'Just Starting', 1: '1 year', 2: '2 years', 3: '3 years', 5: '5 years',
  10: '10 years', 15: '15 years', 20: '20+ years', 25: '25+ years', 30: '30+ years',
};

const VIBE_FONTS: Record<string, { display: string; body: string }> = {
  modern: { display: 'font-sans font-black', body: 'font-sans' },
  bold: { display: 'font-display font-black', body: 'font-sans' },
  luxury: { display: 'font-serif italic', body: 'font-serif' },
  friendly: { display: 'font-display font-bold', body: 'font-sans' },
  eco: { display: 'font-serif font-bold', body: 'font-sans' },
  gothic: { display: 'font-serif font-black', body: 'font-sans' },
};

const BRAND_ARCHETYPES: Record<string, { archetype: string; tagline: string; strengths: string[]; tip: string }> = {
  modern: {
    archetype: 'The Architect',
    tagline: 'Precision meets purpose. Every pixel intentional.',
    strengths: ['Clean first impressions', 'Professional credibility', 'Timeless appeal'],
    tip: 'Your brand thrives on whitespace and restraint. Less is your superpower.',
  },
  bold: {
    archetype: 'The Disruptor',
    tagline: 'You didn\'t start a business to blend in.',
    strengths: ['Instant recognition', 'Emotional impact', 'Competitive edge'],
    tip: 'Lead with color and confidence. Your energy IS the brand.',
  },
  luxury: {
    archetype: 'The Connoisseur',
    tagline: 'Excellence isn\'t expensive — it\'s invaluable.',
    strengths: ['Premium positioning', 'Trust & authority', 'High-value clients'],
    tip: 'Every detail signals quality. Invest in materials that match your standards.',
  },
  friendly: {
    archetype: 'The Neighbor',
    tagline: 'The business everyone recommends by name.',
    strengths: ['Word-of-mouth magnet', 'Community trust', 'Repeat customers'],
    tip: 'Your warmth is your brand. Show faces, tell stories, be real.',
  },
  eco: {
    archetype: 'The Steward',
    tagline: 'Building something that lasts — for everyone.',
    strengths: ['Values-driven loyalty', 'Conscious consumers', 'Purpose-driven growth'],
    tip: 'Lead with mission, not marketing. Your audience wants to believe.',
  },
  gothic: {
    archetype: 'The Visionary',
    tagline: 'For those who see beauty in the unconventional.',
    strengths: ['Cult following potential', 'Unforgettable identity', 'Niche dominance'],
    tip: 'Lean into the darkness. Your audience finds you — you don\'t chase them.',
  },
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function calcTotal(items: string[]): number {
  return items.reduce((sum, id) => {
    const found = ALL_ITEMS.find(i => i.id === id);
    return sum + (found?.price ?? 0);
  }, 0);
}

function suggestTier(total: number): { tier: 'budget' | 'premium' | 'elite' | null; discount: number; name: string } {
  if (total >= 1000) return { tier: 'elite', discount: 30, name: 'Elite Package' };
  if (total >= 500) return { tier: 'premium', discount: 20, name: 'Premium Package' };
  return { tier: null, discount: 0, name: '' };
}

function getYearLabel(v: number): string {
  if (v === 0) return 'Just Starting';
  if (v <= 2) return `${v} year${v > 1 ? 's' : ''}`;
  if (v <= 5) return '3-5 years';
  if (v <= 10) return '5-10 years';
  if (v <= 20) return '10-20 years';
  return '20+ years';
}

/* ═══════════════════════════════════════════════════════
   CONFETTI (canvas-based, no external lib)
   ═══════════════════════════════════════════════════════ */

function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const colors = ['#00E0C6', '#D255FF', '#FFD700', '#FF6B6B', '#4ECDC4', '#FF9F43'];
  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 14,
    vy: -(Math.random() * 12 + 4),
    w: Math.random() * 10 + 4,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    opacity: 1,
  }));

  let frame = 0;
  const maxFrames = 120;

  function animate() {
    if (frame >= maxFrames) { ctx!.clearRect(0, 0, canvas.width, canvas.height); return; }
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.vy += 0.35;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - frame / maxFrames);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    });
    frame++;
    requestAnimationFrame(animate);
  }
  animate();
}

/* ═══════════════════════════════════════════════════════
   BRAND PROFILE GENERATOR (text-based, no deps)
   ═══════════════════════════════════════════════════════ */

function generateProfileText(data: {
  companyName: string; ownerName: string; industry: string; location: string;
  vibe: string; archetype: string; tagline: string; strengths: string[];
  tip: string; palette: string[]; items: string[]; total: number; tier: string;
}): string {
  const line = '═'.repeat(48);
  return [
    line,
    '  BRAND PERSONALITY PROFILE',
    `  Prepared for ${data.companyName || 'Your Brand'}`,
    `  by XELA Creative Branding Studio`,
    line,
    '',
    `  Owner: ${data.ownerName || 'N/A'}`,
    `  Industry: ${data.industry || 'N/A'}`,
    `  Location: ${data.location || 'N/A'}`,
    '',
    `  BRAND ARCHETYPE: ${data.archetype}`,
    `  "${data.tagline}"`,
    '',
    '  BRAND STRENGTHS:',
    ...data.strengths.map(s => `    ✦ ${s}`),
    '',
    '  COLOR DIRECTION:',
    `    ${data.palette.join('  |  ')}`,
    '',
    `  BRAND STYLE: ${data.vibe}`,
    '',
    '  PRO TIP:',
    `    ${data.tip}`,
    '',
    data.items.length > 0 ? `  RECOMMENDED PACKAGE: ${data.tier}` : '',
    data.items.length > 0 ? `  SELECTED SERVICES: ${data.items.join(', ')}` : '',
    data.total > 0 ? `  ESTIMATED INVESTMENT: $${data.total.toLocaleString()}` : '',
    '',
    line,
    '  XELA Creative Branding Studio',
    '  (321) 375-9685 | Brevard County, FL',
    '  "From Pain to Purpose."',
    line,
  ].filter(Boolean).join('\n');
}

function downloadProfile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════
   ANIMATED NUMBER
   ═══════════════════════════════════════════════════════ */

function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef(value);

  useEffect(() => {
    const from = ref.current;
    const to = value;
    ref.current = to;
    if (from === to) return;
    const dur = 400;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <span>${display.toLocaleString()}</span>;
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export const ConsultationWizard: React.FC<ConsultationWizardProps> = ({ onComplete, onSelectPackage, onGetStarted }) => {
  /* ── state ── */
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [showResume, setShowResume] = useState(false);

  const [goal, setGoal] = useState('');
  const [vibe, setVibe] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [location, setLocation] = useState('Florida');
  const [yearsInBusiness, setYearsInBusiness] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<Array<'call' | 'text' | 'email'>>([]);
  const [bestTime, setBestTime] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const confettiRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  /* ── derived ── */
  const total = useMemo(() => calcTotal(selectedItems), [selectedItems]);
  const tierSuggestion = useMemo(() => suggestTier(total), [total]);
  const discountedTotal = useMemo(() => {
    if (!tierSuggestion.tier) return total;
    return Math.round(total * (1 - tierSuggestion.discount / 100));
  }, [total, tierSuggestion]);

  const filteredIndustries = useMemo(() => {
    if (!industrySearch) return INDUSTRIES;
    const q = industrySearch.toLowerCase();
    return INDUSTRIES.filter(i => i.toLowerCase().includes(q));
  }, [industrySearch]);

  const selectedVibe = VIBES.find(v => v.id === vibe);

  /* ── localStorage persistence ── */
  const saveState = useCallback(() => {
    const draft = {
      step, goal, vibe, industry, customIndustry, companyName, ownerName,
      location, yearsInBusiness, selectedItems, contactName, contactEmail,
      contactPhone, preferredContact, bestTime, additionalNotes,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch {}
  }, [step, goal, vibe, industry, customIndustry, companyName, ownerName, location, yearsInBusiness, selectedItems, contactName, contactEmail, contactPhone, preferredContact, bestTime, additionalNotes]);

  const debouncedSave = useMemo(() => debounce(saveState, 500), [saveState]);

  useEffect(() => { debouncedSave(); }, [debouncedSave]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.goal || d.companyName || d.selectedItems?.length) {
          setShowResume(true);
        }
      }
    } catch {}
  }, []);

  const resumeDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.step) setStep(d.step);
      if (d.goal) setGoal(d.goal);
      if (d.vibe) setVibe(d.vibe);
      if (d.industry) setIndustry(d.industry);
      if (d.customIndustry) setCustomIndustry(d.customIndustry);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.ownerName) setOwnerName(d.ownerName);
      if (d.location) setLocation(d.location);
      if (d.yearsInBusiness) setYearsInBusiness(d.yearsInBusiness);
      if (d.selectedItems) setSelectedItems(d.selectedItems);
      if (d.contactName) setContactName(d.contactName);
      if (d.contactEmail) setContactEmail(d.contactEmail);
      if (d.contactPhone) setContactPhone(d.contactPhone);
      if (d.preferredContact) setPreferredContact(Array.isArray(d.preferredContact) ? d.preferredContact : [d.preferredContact]);
      if (d.bestTime) setBestTime(d.bestTime);
      if (d.additionalNotes) setAdditionalNotes(d.additionalNotes);
    } catch {}
    setShowResume(false);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShowResume(false);
  }, []);

  /* ── navigation ── */
  const goNext = useCallback(() => {
    if (step === 7) {
      if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        setEmailError("Hmm, that doesn't look quite right — mind double-checking?");
        return;
      }
      setEmailError('');
      const digitsOnly = (contactPhone || '').replace(/\D/g, '');
      if (contactPhone && digitsOnly.length < 10) {
        setPhoneError("Phone number should be at least 10 digits.");
        return;
      }
      setPhoneError('');
      if (!contactName && !ownerName) {
        return; // require at least a name
      }
    }
    if (step === 4 && !companyName.trim()) {
      return; // require company name
    }
    if (step >= TOTAL_STEPS) return;
    setDirection(1);
    setStep(s => s + 1);
  }, [step, contactEmail, contactPhone, contactName, ownerName, companyName]);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    setDirection(-1);
    setStep(s => s - 1);
  }, [step]);

  /* fire confetti on step 8 */
  useEffect(() => {
    if (step === 8 && confettiRef.current) {
      setTimeout(() => {
        if (confettiRef.current) launchConfetti(confettiRef.current);
      }, 400);
    }
  }, [step]);

  /* milestone toasts at key steps */
  const [milestoneMsg, setMilestoneMsg] = useState('');
  useEffect(() => {
    const msgs: Record<number, string> = {
      3: '25% done — you\'re flying through this!',
      5: 'Halfway there — your brand is taking shape!',
      7: 'Almost done — just your contact info left!',
    };
    if (msgs[step]) {
      setMilestoneMsg(msgs[step]);
      const t = setTimeout(() => setMilestoneMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [step]);

  /* fire onComplete and submit when reaching step 8 */
  useEffect(() => {
    if (step === 8) {
      const finalIndustry = industry === 'Other' ? customIndustry : industry;
      const data: ConsultationData = {
        goal, vibe, industry: finalIndustry,
        companyName, ownerName, location, yearsInBusiness, selectedItems,
        totalPrice: discountedTotal, suggestedTier: tierSuggestion.tier,
        contactName: contactName || ownerName, contactEmail, contactPhone,
        preferredContact, bestTime, additionalNotes,
      };
      onComplete?.(data);
      if (tierSuggestion.tier) onSelectPackage?.(tierSuggestion.tier);
      localStorage.removeItem(STORAGE_KEY);

      // Submit to formsubmit.co (fire-and-forget) — gated by rate limiter
      if (!rateLimitOk()) { logSubmission('consultation-wizard', data); return; }
      const itemLabels = selectedItems.map(id => ALL_ITEMS.find(i => i.id === id)?.label).filter(Boolean);
      const body = new FormData();
      body.append('_subject', `🚨 NEW LEAD · ${companyName || 'Unknown'} · ${tierSuggestion.name || 'Custom'} · ACTION NEEDED`);
      body.append('_template', 'box');
      body.append('_captcha', 'false');
      body.append('_honey', ''); // formsubmit.co honeypot — bots fill this
      body.append('_cc', 'bookittyfirepro@yahoo.com,bookityfirepro321@gmail.com');
      body.append('Name', contactName || ownerName || 'Not provided');
      body.append('Email', contactEmail || 'Not provided');
      body.append('Phone', contactPhone || 'Not provided');
      body.append('Company', companyName || 'Not provided');
      body.append('Industry', finalIndustry || 'Not provided');
      body.append('Location', location || 'Not provided');
      body.append('Goal', goal || 'Not specified');
      body.append('Vibe', selectedVibe?.label || vibe || 'Not specified');
      body.append('Years in Business', getYearLabel(yearsInBusiness));
      body.append('Selected Services', itemLabels.join(', ') || 'None selected');
      body.append('Estimated Total', `$${discountedTotal.toLocaleString()}`);
      body.append('Suggested Package', tierSuggestion.name || 'Custom');
      body.append('Preferred Contact', preferredContact.join(', '));
      body.append('Best Time', bestTime);
      body.append('Additional Notes', additionalNotes || 'None');
      const actionItems = [
        `1. Review brand personality profile for ${companyName || 'client'}`,
        `2. Prepare ${tierSuggestion.name || 'custom'} quote (est: $${discountedTotal.toLocaleString()})`,
        `3. ${preferredContact.includes('call') ? `Call ${contactPhone} within 2 hours` : `Send welcome email to ${contactEmail}`}`,
        `4. Research ${finalIndustry} competitors in ${location}`,
        `5. Draft personalized welcome email with package breakdown`,
      ].join('\n');
      body.append('Action Items For Alex', actionItems);
      fetch('https://formsubmit.co/ajax/xelabrandingstudio@gmail.com', {
        method: 'POST',
        body,
      }).catch(() => {});
      logSubmission('consultation-wizard', {
        ...data,
        phone: contactPhone,
        email: contactEmail,
        services: itemLabels,
      });
    }
  }, [step]);

  /* ── keyboard nav ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (e.key === 'ArrowRight' && !isInput) {
        if (step < TOTAL_STEPS) goNext();
      }
      if (e.key === 'Enter' && !isInput) {
        if (step < TOTAL_STEPS) goNext();
      }
      if (e.key === 'ArrowLeft' && !isInput) goBack();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, goNext, goBack]);

  /* ── swipe nav ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const tag = (e.target as HTMLElement).tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goNext();
      else goBack();
    }
  }, [goNext, goBack]);

  /* ── toggle deliverable ── */
  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  /* ── pre-fill contact name from owner ── */
  useEffect(() => {
    if (step === 7 && ownerName && !contactName) {
      setContactName(ownerName);
    }
  }, [step, ownerName, contactName]);

  /* ═══════════════════════════════════════════════════════
     SLIDE VARIANTS
     ═══════════════════════════════════════════════════════ */
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const slideVariants = prefersReducedMotion ? {
    enter: () => ({ opacity: 0 }),
    center: { opacity: 1 },
    exit: () => ({ opacity: 0 }),
  } : {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  /* ═══════════════════════════════════════════════════════
     STEP RENDERERS
     ═══════════════════════════════════════════════════════ */

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight">Hey — what brings you here today?</h2>
        <p className="text-white/60 font-medium text-lg">Pick whichever feels closest. We'll handle the rest.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="flex -space-x-2">
            {['bg-brand-teal','bg-brand-lavender','bg-amber-400','bg-rose-400','bg-blue-400'].map((c,i) => (
              <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-brand-paper`} />
            ))}
          </div>
          <span className="text-sm text-stone-400 font-bold">Brevard County's <span className="text-brand-teal">AI-powered</span> creative studio</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {GOALS.map(g => (
          <motion.button key={g.id}
            whileHover={{ scale: 1.03, rotateY: 3, rotateX: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setGoal(g.id); setTimeout(goNext, 300); }}
            className={`relative p-8 rounded-[2rem] border-2 transition-all text-left
              ${goal === g.id
                ? 'border-brand-teal bg-brand-teal/5 shadow-xl shadow-brand-teal/10'
                : 'border-white/10 bg-white/5 hover:border-brand-teal/40 hover:bg-white/10 hover:shadow-lg'}
            `}
          >
            {goal === g.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-brand-teal flex items-center justify-center">
                <Check size={16} className="text-white" />
              </motion.div>
            )}
            <g.Icon size={36} className={goal === g.id ? 'text-brand-teal' : 'text-stone-400'} />
            <h3 className="text-xl font-black text-white mt-4">{g.label}</h3>
            <p className="text-white/50 text-sm mt-1">{g.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight">What's your vibe?</h2>
        <p className="text-white/60 font-medium text-lg">Go with your gut — pick the look that feels like you.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
        {VIBES.map(v => (
          <motion.button key={v.id}
            whileHover={{ scale: 1.04, rotateY: 2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setVibe(v.id); setTimeout(goNext, 300); }}
            className={`relative overflow-hidden rounded-[2rem] border-2 transition-all text-left
              ${vibe === v.id
                ? 'border-brand-teal ring-4 ring-brand-teal/30 shadow-xl'
                : 'border-white/10 bg-white/5 hover:border-brand-teal/40 hover:bg-white/10'}
            `}
          >
            <div className={`h-28 bg-gradient-to-br ${v.gradient} flex items-center justify-center relative`}>
              {vibe === v.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute inset-0 bg-brand-teal/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
                    <Check size={24} className="text-white" />
                  </div>
                </motion.div>
              )}
              <v.Icon size={32} className="text-white/60" />
            </div>
            <div className="p-5">
              <h3 className="font-black text-white text-base">{v.label}</h3>
              <div className="flex gap-2 mt-3">
                {v.palette.map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight">{goal === 'new-business' ? 'What line of work are you getting into?' : 'What line of work are you in?'}</h2>
        <p className="text-white/60 font-medium text-lg">We tailor every detail to your niche — the more specific, the better.</p>
      </div>
      <div className="relative">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Start typing your industry..."
          value={industrySearch}
          onChange={e => setIndustrySearch(e.target.value)}
          className="input-premium w-full pl-14 pr-6 py-5 text-lg rounded-[2rem]"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {filteredIndustries.map(ind => (
          <motion.button key={ind}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIndustry(ind);
              if (ind !== 'Other') setTimeout(goNext, 300);
            }}
            className={`px-5 py-3 rounded-full font-bold text-sm transition-all
              ${industry === ind
                ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-brand-teal'}
            `}
          >
            {ind}
          </motion.button>
        ))}
      </div>
      {industry === 'Other' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <input
            type="text"
            placeholder="Tell us what you do in a few words..."
            value={customIndustry}
            onChange={e => setCustomIndustry(e.target.value)}
            className="input-premium w-full px-6 py-4 text-lg rounded-[2rem]"
          />
        </motion.div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight">Tell us about your business</h2>
        <p className="text-white/60 font-medium text-lg">{vibe ? `Love it — ${selectedVibe?.label?.toLowerCase()} energy. Now the basics so we can make it yours.` : 'Just the basics so we can make this personal.'}</p>
      </div>
      <div className="space-y-5">
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">What's it called?</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
            placeholder="Your business name"
            className="input-premium w-full px-6 py-5 text-2xl font-bold rounded-[2rem]" />
        </div>
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">And who are we talking to?</label>
          <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
            placeholder="Your name"
            className="input-premium w-full px-6 py-4 rounded-[2rem]" />
        </div>
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">Where are you based?</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="City, State"
            className="input-premium w-full px-6 py-4 rounded-[2rem]" />
        </div>
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">
            How long have you been doing this? <span className="text-brand-teal">{getYearLabel(yearsInBusiness)}</span>
          </label>
          <input type="range" min={0} max={30} value={yearsInBusiness}
            onChange={e => setYearsInBusiness(Number(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-full appearance-none cursor-pointer accent-brand-teal"
          />
          <div className="flex justify-between text-[10px] font-bold text-stone-400 mt-1 tracking-wide">
            <span>New</span><span>5 yrs</span><span>10 yrs</span><span>20+</span><span>30+</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight">{companyName ? `What does ${companyName} need?` : 'What do you need?'}</h2>
        <p className="text-white/60 font-medium text-lg">Grab anything that sounds useful — we'll bundle it smart so you save more.</p>
      </div>

      {/* Smart presets */}
      <div className="space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender pl-1">Quick Start — tap to auto-fill (save up to 40% with our packages)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(industry && INDUSTRY_SUGGESTIONS[industry]
            ? [{ label: `Perfect for ${industry}`, desc: 'Our recommendation based on your industry', items: INDUSTRY_SUGGESTIONS[industry] }, ...SMART_PRESETS]
            : SMART_PRESETS
          ).slice(0, 4).map((preset, i) => {
            const isActive = preset.items.every(id => selectedItems.includes(id));
            return (
              <motion.button key={i}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItems(prev => {
                  const newSet = new Set(prev);
                  preset.items.forEach(id => newSet.add(id));
                  return Array.from(newSet);
                })}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  isActive
                    ? 'border-brand-lavender bg-brand-lavender/5'
                    : 'border-white/10 bg-white/5 hover:border-brand-lavender/40 hover:bg-white/10'
                }`}
              >
                <p className={`font-black text-sm ${isActive ? 'text-brand-lavender' : 'text-white'}`}>
                  {isActive && <Check size={14} className="inline mr-1 -mt-0.5" />}
                  {preset.label}
                </p>
                <p className="text-xs text-white/50 mt-0.5">{preset.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-white/40 text-center italic">Individual prices shown. Select $500+ to unlock 20% off, or $1,000+ for 30% off with a package tier.</p>

      <div className="space-y-8">
        {DELIVERABLES.map(cat => (
          <div key={cat.category}>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-3 pl-1">{cat.category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.items.map(item => {
                const active = selectedItems.includes(item.id);
                return (
                  <motion.button key={item.id}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left
                      ${active
                        ? 'border-brand-teal bg-brand-teal/5'
                        : 'border-white/10 bg-white/5 hover:border-brand-teal/40 hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                        ${active ? 'bg-brand-teal border-brand-teal' : 'border-stone-300'}`}>
                        {active && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`font-bold ${active ? 'text-white' : 'text-white/70'}`}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-stone-400 tracking-wider">{item.tier}</span>
                      <span className={`text-sm font-black ${active ? 'text-brand-teal' : 'text-stone-400'}`}>${item.price}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Running total */}
      <motion.div layout
        className="sticky bottom-4 glass rounded-[2rem] p-6 shadow-2xl border border-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Your Build</span>
            {selectedItems.length > 0 && (
              <button onClick={() => setSelectedItems([])}
                className="text-[10px] font-bold text-stone-300 hover:text-red-400 transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div className="text-3xl font-black text-white" aria-live="polite" aria-atomic="true">
            <AnimatedPrice value={total} />
            {tierSuggestion.tier && (
              <span className="text-lg text-brand-teal ml-3 font-bold line-through decoration-stone-300 decoration-2">
                {/* show original */}
              </span>
            )}
          </div>
        </div>
        {tierSuggestion.tier && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-teal/10 text-brand-teal rounded-2xl px-5 py-3 text-sm font-bold text-center">
            <Sparkles size={14} className="inline mr-1 -mt-0.5" />
            This matches our <span className="font-black">{tierSuggestion.name}</span> — save {tierSuggestion.discount}%!
            <div className="text-xs text-brand-teal/70 mt-1">
              You pay: <span className="font-black text-brand-teal">${discountedTotal.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  const renderStep6 = () => {
    const vibeData = selectedVibe || VIBES[0];
    const fonts = VIBE_FONTS[vibe] || VIBE_FONTS.modern;
    const displayName = companyName || 'Your Brand';
    const archetype = BRAND_ARCHETYPES[vibe] || BRAND_ARCHETYPES.modern;
    const finalIndustry = industry === 'Other' ? customIndustry : industry;

    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender inline-block px-4 py-1.5 rounded-full bg-brand-lavender/10">Your Brand Personality Profile</span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight">
            {ownerName ? `${ownerName.split(' ')[0]}, meet your brand.` : 'Meet your brand.'}
          </h2>
        </div>

        {/* Brand Personality Card — the $500 moment */}
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">

          {/* Hero band with brand name */}
          <div className={`bg-gradient-to-br ${vibeData.gradient} p-12 text-center relative overflow-hidden`}>
            <motion.div className="absolute inset-0 opacity-10"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
              style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
            <div className="relative z-10">
              <p className={`text-5xl md:text-6xl ${fonts.display} ${
                vibeData.id === 'luxury' || vibeData.id === 'gothic' || vibeData.id === 'bold' ? 'text-white' : 'text-brand-black'
              } leading-tight`}>
                {displayName}
              </p>
              {finalIndustry && (
                <p className={`mt-3 text-sm font-bold uppercase tracking-widest opacity-60 ${
                  vibeData.id === 'luxury' || vibeData.id === 'gothic' || vibeData.id === 'bold' ? 'text-white' : 'text-brand-black'
                }`}>
                  {finalIndustry}{location ? ` \u00b7 ${location}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Archetype reveal */}
          <div className="bg-brand-black p-8 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">Your Brand Archetype</span>
              <p className="text-3xl font-black text-white mt-2">{archetype.archetype}</p>
              <p className="text-brand-teal/80 font-medium italic mt-1">{archetype.tagline}</p>
            </motion.div>
          </div>

          {/* Profile content */}
          <div className="bg-brand-black p-8 space-y-8 border-t border-white/10">
            {/* Color palette */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Your Color Direction</span>
              <div className="flex gap-3 mt-3">
                {vibeData.palette.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-2xl shadow-lg border border-stone-100" style={{ backgroundColor: c }} />
                    <span className="text-[9px] font-mono text-stone-400">{c}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Typography Direction</span>
              <p className={`text-3xl mt-2 ${fonts.display} text-white`}>Headline Style</p>
              <p className={`text-base mt-1 ${fonts.body} text-white/60`}>Body text — clean, readable, and on-brand.</p>
            </div>

            {/* Strengths */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Your Brand Strengths</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {archetype.strengths.map((s, i) => (
                  <motion.span key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="px-4 py-2 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-bold">
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Pro tip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">Pro Tip from XELA</span>
              <p className="text-white/70 font-medium mt-1 text-sm leading-relaxed">{archetype.tip}</p>
            </motion.div>

            {/* Selected package summary */}
            {selectedItems.length > 0 && (
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Your Build ({selectedItems.length} items)</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedItems.map(id => {
                    const item = ALL_ITEMS.find(i => i.id === id);
                    return item ? (
                      <span key={id} className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-bold">{item.label}</span>
                    ) : null;
                  })}
                </div>
                {tierSuggestion.tier && (
                  <p className="text-brand-teal font-bold text-sm mt-3">
                    <Sparkles size={14} className="inline mr-1 -mt-0.5" />
                    Matches our {tierSuggestion.name} — save {tierSuggestion.discount}%
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Dynamic portfolio proof */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">The Transformation</span>
            <h3 className="text-lg font-black text-white mt-1">
              {industry && industry !== 'Other'
                ? `What a ${industry.toLowerCase()} brand looks like with XELA`
                : 'What your brand could become'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-0">
            <div className="p-6 bg-white/[0.02] text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-3">Before</span>
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="text-3xl font-black text-white/40">?</span>
              </div>
              <p className="text-xs text-white/40 mt-2 font-medium">Where you start</p>
            </div>
            <div className="p-6 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-teal block mb-3">After</span>
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${selectedVibe?.gradient || 'from-brand-teal to-brand-lavender'} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-black text-white">X</span>
              </div>
              <p className="text-xs text-brand-teal mt-2 font-bold">Where we take you</p>
            </div>
          </div>
          <div className="p-4 bg-brand-teal/5 text-center">
            <p className="text-xs font-bold text-stone-500">
              <span className="text-brand-teal font-black">Our promise:</span> Same-day delivery on every package
            </p>
          </div>
        </motion.div>

        {/* Social proof */}
        <div className="glass rounded-[2rem] p-8 text-center space-y-3">
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-stone-600 font-medium italic text-lg">
            "Whatever you do, work at it with all your heart, as working for the Lord."
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Colossians 3:23 — The standard we build by
          </p>
        </div>
      </div>
    );
  };

  const renderStep7 = () => (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight">{ownerName ? `Almost done, ${ownerName.split(' ')[0]}!` : 'Last step!'}</h2>
        <p className="text-white/60 font-medium text-lg">Where should we send your custom quote?</p>
      </div>
      <div className="space-y-5">
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">Your Name</label>
          <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
            placeholder="Your full name" className="input-premium w-full px-6 py-4 rounded-[2rem]" />
        </div>
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">Best email</label>
          <input type="email" value={contactEmail} onChange={e => { setContactEmail(e.target.value); setEmailError(''); }}
            placeholder="you@yourbusiness.com"
            className={`input-premium w-full px-6 py-4 rounded-[2rem] ${emailError ? 'border-red-400 ring-2 ring-red-200' : ''}`} />
          {emailError && <p className="text-red-500 text-sm mt-1 pl-2 font-medium">{emailError}</p>}
          <p className="text-[10px] text-stone-300 mt-1 pl-2 flex items-center gap-1"><Shield size={10} /> Your info stays with us — never shared, never sold</p>
        </div>
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">Phone <span className="text-stone-300 normal-case tracking-normal">(optional)</span></label>
          <input type="tel" value={contactPhone} onChange={e => { setContactPhone(e.target.value); setPhoneError(''); }}
            placeholder="(321) 555-1234" className={`input-premium w-full px-6 py-4 rounded-[2rem] ${phoneError ? 'border-red-400 ring-2 ring-red-200' : ''}`} />
          {phoneError && <p className="text-red-500 text-sm mt-1 pl-2 font-medium">{phoneError}</p>}
        </div>

        {/* Preferred contact — multi-select */}
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3 block">How do you like to be reached? <span className="normal-case tracking-normal text-white/40">(pick all that work)</span></label>
          <div className="flex gap-3">
            {([
              { id: 'call' as const, Icon: Phone, label: 'Call' },
              { id: 'text' as const, Icon: MessageSquare, label: 'Text' },
              { id: 'email' as const, Icon: Mail, label: 'Email' },
            ]).map(m => (
              <motion.button key={m.id} whileTap={{ scale: 0.95 }}
                onClick={() => setPreferredContact(prev =>
                  prev.includes(m.id) ? prev.filter(c => c !== m.id) : [...prev, m.id]
                )}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-bold transition-all
                  ${preferredContact.includes(m.id)
                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal'
                    : 'border-white/10 text-white/60 hover:border-white/20 hover:bg-white/5'}
                `}
              >
                <m.Icon size={18} />
                {m.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Best time */}
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3 block">When's a good time to catch you?</label>
          <div className="flex gap-3">
            {([
              { id: 'morning' as const, Icon: Sun, label: 'Morning' },
              { id: 'afternoon' as const, Icon: Clock, label: 'Afternoon' },
              { id: 'evening' as const, Icon: Moon, label: 'Evening' },
            ]).map(t => (
              <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                onClick={() => setBestTime(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold text-sm transition-all
                  ${bestTime === t.id
                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal'
                    : 'border-white/10 text-white/60 hover:border-white/20 hover:bg-white/5'}
                `}
              >
                <t.Icon size={16} />
                {t.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label-premium text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 block">Anything else we should know? <span className="text-stone-300">(Optional)</span></label>
          <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
            rows={3} placeholder="Timeline, budget thoughts, competitors you love, your origin story..."
            className="input-premium w-full px-6 py-4 rounded-[2rem] resize-none" />
        </div>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-8 max-w-2xl mx-auto text-center relative">
      <canvas ref={confettiRef} className="absolute inset-0 w-full h-full pointer-events-none z-50" />

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
        <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={48} className="text-brand-teal" />
        </div>
        <h2 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight">You're In!</h2>
        <p className="text-white/60 font-medium text-lg mt-3">We got your brief — here's what happens next:</p>
      </motion.div>

      {/* Timeline */}
      <div className="space-y-0">
        {[
          { num: '1', text: 'We review your brief', sub: 'Within 2 hours', delay: 0.2 },
          { num: '2', text: 'Custom quote sent to your inbox', sub: 'Same day', delay: 0.4 },
          { num: '3', text: 'Your brand kit delivered', sub: 'Same day after approval', delay: 0.6 },
        ].map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.delay, duration: 0.5 }}
            className="flex items-center gap-5 text-left py-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-teal flex items-center justify-center text-white font-black text-lg shrink-0">
              {item.num}
            </div>
            <div className="flex-1">
              {i > 0 && <div className="w-0.5 h-4 bg-brand-teal/20 ml-5 -mt-9 mb-5 hidden" />}
              <p className="font-bold text-white text-lg">{item.text}</p>
              <p className="text-white/50 text-sm font-medium">{item.sub}</p>
            </div>
            {i < 2 && <ArrowRight size={18} className="text-brand-teal/40 hidden sm:block" />}
          </motion.div>
        ))}
      </div>

      {/* Package recommendation */}
      {tierSuggestion.tier && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="glass-dark rounded-[2rem] p-8 text-white space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">Your Recommended Package</span>
          <p className="text-3xl font-black">{tierSuggestion.name}</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-stone-400 line-through text-lg">${total.toLocaleString()}</span>
            <span className="text-4xl font-black text-brand-teal">${discountedTotal.toLocaleString()}</span>
          </div>
          <p className="text-brand-teal text-sm font-bold">You save ${(total - discountedTotal).toLocaleString()} ({tierSuggestion.discount}% off)</p>
        </motion.div>
      )}

      {/* Capacity indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5 text-center">
        <p className="text-sm font-bold text-amber-800">
          <Clock size={14} className="inline mr-1 -mt-0.5 text-amber-600" />
          Every project gets our <span className="font-black">full attention</span> — we don't rush your brand.
        </p>
        <p className="text-xs text-amber-600 mt-1 font-medium">
          Now booking for <span className="font-black">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </p>
      </motion.div>

      {/* Download profile */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
        className="pt-2">
        <button
          onClick={() => {
            const arch = BRAND_ARCHETYPES[vibe] || BRAND_ARCHETYPES.modern;
            const vibeData = selectedVibe || VIBES[0];
            const itemLabels = selectedItems.map(id => ALL_ITEMS.find(i => i.id === id)?.label).filter(Boolean) as string[];
            const text = generateProfileText({
              companyName, ownerName,
              industry: industry === 'Other' ? customIndustry : industry,
              location, vibe: vibeData.label,
              archetype: arch.archetype, tagline: arch.tagline,
              strengths: arch.strengths, tip: arch.tip,
              palette: vibeData.palette, items: itemLabels,
              total: discountedTotal, tier: tierSuggestion.name || 'Custom',
            });
            downloadProfile(text, `${(companyName || 'brand').replace(/\s+/g, '-').toLowerCase()}-profile.txt`);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-lavender/10 text-brand-lavender font-bold text-sm hover:bg-brand-lavender/20 transition-all"
        >
          <ArrowRight size={16} className="rotate-90" />
          Download Your Brand Profile
        </button>
      </motion.div>

      {/* Primary CTA — Get Started */}
      {tierSuggestion.tier && onGetStarted && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="pt-4">
          <button
            onClick={() => onGetStarted(tierSuggestion.tier!)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 rounded-full bg-brand-teal text-white font-black text-lg uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand-teal/25"
          >
            <Zap size={22} /> Get Started
          </button>
        </motion.div>
      )}

      {/* Secondary CTAs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <a href="tel:+13213759685"
          className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[2rem] font-black text-lg">
          <Phone size={20} /> Call Us Now
        </a>
        <button
          onClick={() => {
            document.getElementById('portfolio-peek')?.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[2rem] font-black text-lg">
          View Our Work <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */

  const steps = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8];

  return (
    <div ref={containerRef}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      className={`relative w-full min-h-screen overflow-hidden transition-colors duration-700 ${
        vibe === 'luxury' ? 'bg-[#0a0a0a]' :
        vibe === 'gothic' ? 'bg-[#0d0816]' :
        vibe === 'bold' ? 'bg-[#1a0a00]' :
        vibe === 'eco' ? 'bg-[#001a0d]' :
        vibe === 'friendly' ? 'bg-[#1a1000]' :
        'bg-brand-black'
      }`}
    >
      {/* Resume draft banner */}
      <AnimatePresence>
        {showResume && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-brand-black text-white p-3 sm:p-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold shadow-2xl safe-top">
            <span>You have an unfinished consultation. Pick up where you left off?</span>
            <button onClick={resumeDraft}
              className="px-5 py-2 bg-brand-teal text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-teal/80 transition-all">
              Resume
            </button>
            <button onClick={clearDraft}
              className="px-5 py-2 bg-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
              Start Fresh
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-brand-black/80 safe-top">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Step {step} of {TOTAL_STEPS}
            </span>
            {step < TOTAL_STEPS && (
              <button onClick={() => { setStep(TOTAL_STEPS); setDirection(1); }}
                className="text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-stone-500 transition-colors">
                Skip to end
              </button>
            )}
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden" role="progressbar"
            aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}
            aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-brand-teal to-brand-lavender rounded-full"
              initial={false}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Milestone toast */}
      <AnimatePresence>
        {milestoneMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-brand-teal text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm"
          >
            <Sparkles size={14} className="inline mr-2 -mt-0.5" />
            {milestoneMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {steps[step - 1]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {step < TOTAL_STEPS && (
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-brand-black/80 safe-bottom">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <button onClick={goBack}
              disabled={step === 1}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 rounded-[2rem] font-bold transition-all text-sm sm:text-base min-h-[48px]
                ${step === 1
                  ? 'text-stone-300 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10'}
              `}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button onClick={goNext}
              className="btn-primary flex items-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-3 sm:py-4 rounded-[2rem] font-black text-sm sm:text-lg shadow-xl shadow-brand-teal/20 hover:shadow-brand-teal/40 transition-all min-h-[48px]"
            >
              {step === 7 ? 'Get My Proposal' : 'Continue'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationWizard;

