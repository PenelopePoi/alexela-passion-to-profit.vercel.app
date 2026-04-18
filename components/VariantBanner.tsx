import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useVariant } from '../hooks/useVariant';
import { SiteVariant } from '../services/variantRouter';

export const VariantBanner: React.FC = () => {
  const { variant, config } = useVariant();
  const [isDebug] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('debug') === 'true';
    } catch { return false; }
  });

  if (!isDebug) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-[100] bg-brand-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
    >
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Variant</p>
      <p className="text-white font-bold mb-3">{variant.toUpperCase()}: {config.name}</p>
      <div className="flex gap-2">
        {(['a','b','c','d'] as SiteVariant[]).map(v => (
          <a
            key={v}
            href={`?v=${v}`}
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              variant === v ? 'bg-brand-teal text-brand-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {v}
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default VariantBanner;
