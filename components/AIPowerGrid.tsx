
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Palette, Film, BarChart3, Briefcase, Search, Lock, Play, X, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';

type Category = 'all' | 'branding' | 'marketing' | 'creative' | 'intelligence' | 'business';

interface ServiceEntry {
  id: string;
  name: string;
  description: string;
  category: Category;
  tier: 'free' | 'premium' | 'elite';
}

const SERVICES: ServiceEntry[] = [
  // Branding
  { id: 'brand-strategy', name: 'Brand Strategy', description: 'Full strategy with taglines, mission, vision, colors, typography', category: 'branding', tier: 'free' },
  { id: 'business-names', name: 'Business Names', description: 'Brainstorm 10 creative company name ideas', category: 'branding', tier: 'free' },
  { id: 'mottos', name: 'Mottos & Slogans', description: 'Generate 8 catchy mottos for your brand', category: 'branding', tier: 'free' },
  { id: 'sticker-slogans', name: 'Sticker Slogans', description: '6 punchy slogans for vinyl stickers', category: 'branding', tier: 'free' },
  { id: 'logo-concepts', name: 'Logo Concepts', description: 'AI-generated logo images', category: 'branding', tier: 'free' },
  { id: 'brand-guidelines', name: 'Brand Guidelines', description: 'Formal brand usage document', category: 'branding', tier: 'premium' },
  { id: 'brand-story', name: 'Brand Story', description: 'Origin narrative for your brand', category: 'branding', tier: 'premium' },
  // Marketing
  { id: 'content-calendar', name: 'Content Calendar', description: '30-day social media content plan', category: 'marketing', tier: 'free' },
  { id: 'email-templates', name: 'Email Templates', description: '5 email marketing templates', category: 'marketing', tier: 'free' },
  { id: 'flyer-copy', name: 'Flyer Copy', description: 'Headline, hook, and call to action', category: 'marketing', tier: 'free' },
  { id: 'ad-assets', name: 'Ad Assets', description: 'Video concepts, scripts, optimization tips', category: 'marketing', tier: 'premium' },
  { id: 'sales-pitch', name: 'Sales Pitch', description: 'Persuasive pitch for clients', category: 'marketing', tier: 'premium' },
  { id: 'call-script', name: 'Call Script', description: 'Structured sales call script', category: 'marketing', tier: 'elite' },
  // Creative
  { id: 'image-gen', name: 'Image Generation', description: 'AI images up to 4K resolution', category: 'creative', tier: 'free' },
  { id: 'video-gen', name: 'Video Generation', description: 'AI video via Veo at 720p', category: 'creative', tier: 'premium' },
  { id: 'song-lyrics', name: 'Song Lyrics', description: 'Brand anthem or jingle lyrics', category: 'creative', tier: 'premium' },
  { id: 'asset-bundle', name: 'Asset Bundle', description: 'Full branded stock library', category: 'creative', tier: 'elite' },
  // Intelligence
  { id: 'competitor-analysis', name: 'Competitor Analysis', description: 'Analyze competitor websites', category: 'intelligence', tier: 'premium' },
  { id: 'revenue-projection', name: 'Revenue Projector', description: '12-month revenue forecast', category: 'intelligence', tier: 'premium' },
  { id: 'pitch-deck', name: 'Pitch Deck', description: 'Investor-ready presentation', category: 'intelligence', tier: 'elite' },
  { id: 'grant-proposal', name: 'Grant Proposals', description: 'Fund application generator', category: 'intelligence', tier: 'elite' },
  // Business
  { id: 'branding-packages', name: 'Branding Packages', description: '10 tiered service packages', category: 'business', tier: 'free' },
  { id: 'white-label', name: 'White-Label Kit', description: 'Resellable brand kit export', category: 'business', tier: 'elite' },
  { id: 'format-bridge', name: 'Format Bridge', description: 'Translate brand to any platform', category: 'business', tier: 'premium' },
  { id: 'brand-employee', name: 'AI Employee', description: 'Autonomous multi-task runner', category: 'business', tier: 'elite' },
];

const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All', icon: <Zap className="w-4 h-4" />, color: 'text-stone-600' },
  branding: { label: 'Branding', icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-500' },
  marketing: { label: 'Marketing', icon: <BarChart3 className="w-4 h-4" />, color: 'text-blue-500' },
  creative: { label: 'Creative', icon: <Palette className="w-4 h-4" />, color: 'text-pink-500' },
  intelligence: { label: 'Intelligence', icon: <Film className="w-4 h-4" />, color: 'text-amber-500' },
  business: { label: 'Business', icon: <Briefcase className="w-4 h-4" />, color: 'text-emerald-500' },
};

const TIER_STYLES: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-700',
  premium: 'bg-purple-100 text-purple-700',
  elite: 'bg-amber-900 text-amber-200',
};

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  branding: 'bg-purple-50 text-purple-500',
  marketing: 'bg-blue-50 text-blue-500',
  creative: 'bg-pink-50 text-pink-500',
  intelligence: 'bg-amber-50 text-amber-600',
  business: 'bg-emerald-50 text-emerald-600',
};

interface AIPowerGridProps {
  input: BrandInput;
  strategy: BrandStrategy;
  onUpdateStrategy: (updated: Partial<BrandStrategy>) => void;
}

export const AIPowerGrid: React.FC<AIPowerGridProps> = ({ input, strategy, onUpdateStrategy }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const countByCategory = (cat: Category) => {
    if (cat === 'all') return SERVICES.length;
    return SERVICES.filter((s) => s.category === cat).length;
  };

  const filtered = SERVICES.filter((service) => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q || service.name.toLowerCase().includes(q) || service.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const isLocked = (tier: string) => tier === 'elite';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-brand-black">AI Power Grid</h2>
              <p className="text-stone-400 text-sm">44 AI capabilities at your fingertips</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input
              type="text"
              placeholder="Search capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Count badge */}
          <span className="bg-brand-black text-white text-xs font-black px-3 py-1.5 rounded-full tracking-widest uppercase">
            {filtered.length} tools
          </span>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="flex bg-white p-2 rounded-2xl shadow-md border border-stone-100 gap-1 mb-8 flex-wrap">
        {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-black text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-50'
              }`}
            >
              {meta.icon}
              <span>{meta.label}</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'
                }`}
              >
                {countByCategory(cat)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Service card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((service, i) => {
            const locked = isLocked(service.tier);
            return (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="bg-white rounded-[2rem] p-6 border border-stone-100 hover:shadow-xl transition-all relative overflow-hidden group"
              >
                {/* Locked overlay */}
                {locked && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[2rem]">
                    <div className="flex flex-col items-center gap-2">
                      <Lock className="w-5 h-5 text-stone-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                        Elite Tier
                      </span>
                    </div>
                  </div>
                )}

                {/* Top row: badges */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      CATEGORY_BADGE_STYLES[service.category] || 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {service.category}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      TIER_STYLES[service.tier]
                    }`}
                  >
                    {service.tier}
                  </span>
                </div>

                {/* Name + description */}
                <h3 className="text-lg font-bold text-brand-black mb-1">{service.name}</h3>
                <p className="text-sm text-stone-400 mb-4 leading-relaxed">{service.description}</p>

                {/* Explore button */}
                <button
                  className="text-[10px] font-black uppercase tracking-widest text-brand-teal flex items-center gap-1 group-hover:gap-2 transition-all"
                  onClick={() => {
                    // Future: navigate to relevant tab
                  }}
                >
                  <Play className="w-3 h-3" />
                  Explore
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Subtle decorative gradient on hover */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 font-semibold">No capabilities match your search</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="text-brand-teal text-sm font-semibold mt-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
