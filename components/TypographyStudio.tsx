
import React from 'react';
import { Type, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { BrandStrategy } from '../types';

interface TypographyStudioProps {
  data: BrandStrategy;
  onUpdateTypography: (updated: Partial<BrandStrategy['typographyRecommendation']>) => void;
}

const FONT_PAIRS = [
  {
    name: 'Modern Professional',
    heading: 'Inter',
    body: 'Inter',
    description: 'Clean, neutral, and highly legible. Perfect for tech and modern services.'
  },
  {
    name: 'Elegant Editorial',
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    description: 'Sophisticated and timeless. Ideal for luxury, fashion, and high-end brands.'
  },
  {
    name: 'Technical Precision',
    heading: 'Space Grotesk',
    body: 'JetBrains Mono',
    description: 'Tech-forward and precise. Great for developers, engineers, and data tools.'
  },
  {
    name: 'Classic Heritage',
    heading: 'Libre Baskerville',
    body: 'Source Serif Pro',
    description: 'Trustworthy and established. Perfect for law, finance, and traditional trades.'
  },
  {
    name: 'Bold & Energetic',
    heading: 'Outfit',
    body: 'Plus Jakarta Sans',
    description: 'Friendly, modern, and high-energy. Great for startups and creative agencies.'
  },
  {
    name: 'Neoclassical Grandeur',
    heading: 'Cinzel',
    body: 'Cormorant Garamond',
    description: 'Inspired by classical antiquity. Elegant, balanced, and authoritative.'
  }
];

export const TypographyStudio: React.FC<TypographyStudioProps> = ({ data, onUpdateTypography }) => {
  const currentRecommendation = data.typographyRecommendation;

  return (
    <div className="glass rounded-[3rem] p-10 shadow-xl border-white bg-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Type size={120} />
      </div>

      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-full">
                    <Type size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Typography Studio</span>
                </div>
                <h3 className="text-3xl font-serif font-black text-brand-black leading-tight">
                    Font Pairings & Hierarchy
                </h3>
            </div>
            <button className="p-3 rounded-full hover:bg-stone-100 text-stone-400 transition-all">
                <RefreshCw size={20} />
            </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">Current Selection</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Heading Font</p>
                            <p className="text-xl font-bold text-brand-black">{currentRecommendation.headingFont}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Body Font</p>
                            <p className="text-base text-stone-600">{currentRecommendation.bodyFont}</p>
                        </div>
                        <div className="pt-4 border-t border-stone-200">
                            <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Design Reasoning</p>
                            <p className="text-xs text-stone-500 leading-relaxed italic">
                                "{currentRecommendation.reasoning}"
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-brand-black rounded-3xl text-white space-y-4">
                    <div className="flex items-center gap-3">
                        <Info size={20} className="text-brand-teal" />
                        <h5 className="text-sm font-bold">Pro Tip</h5>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                        Consistency is key. Use your heading font for titles and your body font for all paragraphs to maintain a professional look.
                    </p>
                </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">Recommended Pairings</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                    {FONT_PAIRS.map((pair) => {
                        const isActive = currentRecommendation.headingFont === pair.heading;
                        return (
                            <button
                                key={pair.name}
                                onClick={() => onUpdateTypography({
                                    headingFont: pair.heading,
                                    bodyFont: pair.body,
                                    reasoning: pair.description
                                })}
                                className={`p-6 rounded-[2rem] border-2 text-left transition-all group/pair ${
                                    isActive 
                                    ? 'bg-brand-black border-brand-black text-white shadow-2xl scale-[1.02]' 
                                    : 'bg-white border-stone-100 hover:border-brand-teal hover:shadow-lg'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h5 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-brand-teal' : 'text-stone-400'}`}>
                                        {pair.name}
                                    </h5>
                                    {isActive && <CheckCircle2 size={16} className="text-brand-teal" />}
                                </div>
                                <div className="space-y-1 mb-4">
                                    <p className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-brand-black'}`} style={{ fontFamily: pair.heading }}>
                                        {pair.heading}
                                    </p>
                                    <p className={`text-sm ${isActive ? 'text-stone-400' : 'text-stone-500'}`} style={{ fontFamily: pair.body }}>
                                        {pair.body}
                                    </p>
                                </div>
                                <p className={`text-[10px] leading-relaxed ${isActive ? 'text-stone-500' : 'text-stone-400'}`}>
                                    {pair.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Live Preview Section */}
        <div className="pt-10 border-t border-stone-100">
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-8 text-center">Live Hierarchy Preview</h4>
            <div className="max-w-3xl mx-auto space-y-8 p-10 bg-stone-50 rounded-[3rem] border border-stone-100">
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold text-brand-black leading-tight" style={{ fontFamily: currentRecommendation.headingFont }}>
                        The quick brown fox jumps over the lazy dog.
                    </h1>
                    <p className="text-xl text-stone-500 leading-relaxed" style={{ fontFamily: currentRecommendation.bodyFont }}>
                        Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Subheading</p>
                        <p className="text-lg font-bold text-brand-black" style={{ fontFamily: currentRecommendation.headingFont }}>Section Title</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Caption</p>
                        <p className="text-xs text-stone-500" style={{ fontFamily: currentRecommendation.bodyFont }}>Figure 1.1: Visual balance in modern design.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Action</p>
                        <button className="px-6 py-2 bg-brand-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
