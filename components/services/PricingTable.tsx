import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Star, ChevronDown } from 'lucide-react';

interface PricingTableProps {
  onSelectTier: (tier: 'budget' | 'premium' | 'elite') => void;
}

interface Feature {
  name: string;
  budget: boolean | string;
  premium: boolean | string;
  elite: boolean | string;
}

const FEATURES: Feature[] = [
  { name: 'Logo Design', budget: '1 option', premium: '3 options', elite: '5 options + alternates' },
  { name: 'Business Cards', budget: true, premium: true, elite: true },
  { name: 'Color Palette & Fonts', budget: true, premium: true, elite: true },
  { name: 'Slogan & Mission', budget: true, premium: true, elite: true },
  { name: 'Vinyl Sticker Designs', budget: false, premium: true, elite: true },
  { name: 'Social Media Graphics', budget: false, premium: '4 platforms', elite: '4 platforms + templates' },
  { name: 'Marketing Plan', budget: false, premium: true, elite: true },
  { name: 'Flyer & Ad Copy', budget: false, premium: true, elite: true },
  { name: 'Email Templates', budget: false, premium: '3 templates', elite: '5 templates' },
  { name: 'Brand Guidelines Doc', budget: false, premium: false, elite: true },
  { name: 'Competitor Analysis', budget: false, premium: false, elite: true },
  { name: 'Landing Page', budget: false, premium: false, elite: true },
  { name: 'Video Ad (30s)', budget: false, premium: false, elite: true },
  { name: '30-Day Content Calendar', budget: false, premium: true, elite: true },
  { name: 'Print Coordination', budget: false, premium: false, elite: true },
  { name: 'FL Startup Checklist', budget: false, premium: false, elite: true },
  { name: 'Priority Delivery', budget: false, premium: false, elite: '2hr turnaround' },
  { name: 'Revisions', budget: '1 round', premium: '2 rounds', elite: 'Unlimited' },
];

const TIERS = [
  {
    key: 'budget' as const,
    label: 'Get Started',
    price: '$75',
    sub: 'Starting at',
    description: 'Look professional from day one',
    accent: 'brand-teal',
    bgClass: 'bg-white',
    borderClass: 'border-stone-200',
    btnClass: 'bg-brand-black text-white hover:bg-brand-teal',
    popular: false,
  },
  {
    key: 'premium' as const,
    label: 'Get Customers',
    price: '$249',
    sub: 'Starting at',
    description: 'The engine that gets you paid',
    accent: 'brand-lavender',
    bgClass: 'bg-white',
    borderClass: 'border-brand-lavender/30',
    btnClass: 'bg-brand-lavender text-white hover:bg-brand-black',
    popular: true,
  },
  {
    key: 'elite' as const,
    label: 'Get Everything',
    price: '$799',
    sub: 'Starting at',
    description: 'Full business launch — pain to purpose',
    accent: 'brand-lavender',
    bgClass: 'bg-brand-black',
    borderClass: 'border-brand-lavender/20',
    btnClass: 'bg-brand-lavender text-white hover:bg-white hover:text-brand-black',
    popular: false,
  },
];

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectTier }) => {
  const [expandedMobile, setExpandedMobile] = useState<string | null>('premium');

  const renderValue = (val: boolean | string, tierKey: string) => {
    if (val === false) return <X size={16} className="text-stone-300 mx-auto" />;
    if (val === true) return <Check size={16} className="text-brand-teal mx-auto" strokeWidth={3} />;
    return (
      <span className={`text-xs font-semibold ${tierKey === 'elite' ? 'text-brand-lavender' : 'text-brand-ink'}`}>
        {val}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* ── Desktop Table ── */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-0 rounded-[2rem] overflow-hidden border border-stone-200 bg-white shadow-xl">
          {/* Header row */}
          <div className="p-8 bg-stone-50 border-b border-stone-200 flex items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Compare</p>
              <h3 className="font-serif text-2xl font-bold text-brand-black">Features</h3>
            </div>
          </div>
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 text-center border-b ${
                tier.key === 'elite' ? 'bg-brand-black' : 'bg-white'
              } ${i < 2 ? 'border-r border-stone-200' : ''} border-b-stone-200`}
            >
              {tier.popular && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-lavender text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-b-xl">
                  <Star size={10} className="inline mr-1 -mt-0.5" /> Most Popular
                </div>
              )}
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                tier.key === 'elite' ? 'text-brand-lavender' : 'text-stone-400'
              }`}>
                {tier.sub}
              </p>
              <p className={`text-4xl font-black mb-2 ${
                tier.key === 'elite' ? 'text-white' : 'text-brand-black'
              }`}>
                {tier.price}
              </p>
              <p className={`text-[11px] font-black uppercase tracking-[0.15em] mb-1 ${
                tier.key === 'elite' ? 'text-white/80' : 'text-brand-black'
              }`}>
                {tier.label}
              </p>
              <p className={`text-xs ${tier.key === 'elite' ? 'text-white/50' : 'text-stone-400'}`}>
                {tier.description}
              </p>
            </motion.div>
          ))}

          {/* Feature rows */}
          {FEATURES.map((feature, fi) => (
            <React.Fragment key={feature.name}>
              <div className={`px-8 py-4 text-sm font-medium text-brand-ink border-b border-stone-100 ${fi % 2 === 0 ? 'bg-stone-50/50' : 'bg-white'}`}>
                {feature.name}
              </div>
              {TIERS.map((tier, ti) => (
                <div
                  key={tier.key}
                  className={`px-8 py-4 text-center border-b border-stone-100 ${
                    tier.key === 'elite'
                      ? fi % 2 === 0 ? 'bg-brand-black' : 'bg-white/[0.02]'
                      : fi % 2 === 0 ? 'bg-stone-50/50' : 'bg-white'
                  } ${ti < 2 ? 'border-r border-stone-200' : ''}`}
                >
                  {renderValue(feature[tier.key], tier.key)}
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* CTA row */}
          <div className="p-8 bg-stone-50" />
          {TIERS.map((tier, i) => (
            <div
              key={tier.key}
              className={`p-8 text-center ${tier.key === 'elite' ? 'bg-brand-black' : 'bg-white'} ${i < 2 ? 'border-r border-stone-200' : ''}`}
            >
              <button
                onClick={() => onSelectTier(tier.key)}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.97] ${tier.btnClass}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile Accordion ── */}
      <div className="lg:hidden space-y-4">
        {TIERS.map((tier, tIdx) => {
          const isOpen = expandedMobile === tier.key;
          return (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: tIdx * 0.1 }}
              className={`rounded-[2rem] border-2 overflow-hidden shadow-lg ${
                tier.key === 'elite' ? 'bg-brand-black border-brand-lavender/20' : `bg-white ${tier.borderClass}`
              } ${tier.popular ? 'ring-2 ring-brand-lavender/30' : ''}`}
            >
              {/* Accordion header */}
              <button
                onClick={() => setExpandedMobile(isOpen ? null : tier.key)}
                className="w-full p-6 flex items-center justify-between"
              >
                <div className="text-left">
                  {tier.popular && (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-brand-lavender text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full mb-2">
                      <Star size={9} /> Most Popular
                    </span>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    tier.key === 'elite' ? 'text-brand-lavender' : 'text-stone-400'
                  }`}>
                    {tier.sub} {tier.price}
                  </p>
                  <p className={`text-xl font-black ${tier.key === 'elite' ? 'text-white' : 'text-brand-black'}`}>
                    {tier.label}
                  </p>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${tier.key === 'elite' ? 'text-white/50' : 'text-stone-400'} ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Accordion content */}
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-6 pb-6"
                >
                  <ul className="space-y-3 mb-6">
                    {FEATURES.map(feature => {
                      const val = feature[tier.key];
                      if (val === false) return null;
                      return (
                        <li key={feature.name} className="flex items-start gap-2.5 text-sm">
                          <Check size={14} className="text-brand-teal shrink-0 mt-0.5" strokeWidth={3} />
                          <span className={tier.key === 'elite' ? 'text-white/80' : 'text-brand-ink'}>
                            {feature.name}
                            {typeof val === 'string' && (
                              <span className="text-brand-teal ml-1.5 text-xs font-semibold">({val})</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    onClick={() => onSelectTier(tier.key)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.97] ${tier.btnClass}`}
                  >
                    Get Started
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
