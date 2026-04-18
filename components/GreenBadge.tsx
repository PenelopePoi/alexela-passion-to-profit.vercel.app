import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Leaf, Zap, BarChart3, Award, TrendingDown, Loader2, Check } from 'lucide-react';
import { BrandInput, BrandStrategy, GreenScoreData } from '../types';
import { calculateGreenScore } from '../services/geminiService';

interface GreenBadgeProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const MOCK_API_LOG = [
  { service: 'Brand Strategy', calls: 12 },
  { service: 'Logo Generation', calls: 8 },
  { service: 'Content Calendar', calls: 3 },
  { service: 'Email Templates', calls: 2 },
  { service: 'Video Generation', calls: 1 },
];

const RATING_COLORS: Record<string, string> = {
  A: 'text-green-500 border-green-500',
  B: 'text-brand-teal border-brand-teal',
  C: 'text-yellow-500 border-yellow-500',
  D: 'text-red-500 border-red-500',
};

const RATING_BG: Record<string, string> = {
  A: 'from-green-500/20 to-green-500/5',
  B: 'from-teal-500/20 to-teal-500/5',
  C: 'from-yellow-500/20 to-yellow-500/5',
  D: 'from-red-500/20 to-red-500/5',
};

export const GreenBadge: React.FC<GreenBadgeProps> = ({ input, strategy }) => {
  const [greenScore, setGreenScore] = useState<GreenScoreData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const score = calculateGreenScore(MOCK_API_LOG);
      setGreenScore(score);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyEmbed = async () => {
    const embedHtml = `<a href="https://xela-elite-ai-creative-studio.vercel.app/green-badge/${input.companyName.toLowerCase().replace(/\s+/g, '-')}" target="_blank" rel="noopener"><img src="https://xela-elite-ai-creative-studio.vercel.app/badges/green-certified.svg" alt="Certified Green Brand - ${input.companyName}" width="180" /></a>`;
    await navigator.clipboard.writeText(embedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBadge = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect width="200" height="60" rx="12" fill="#0d9488"/><text x="50" y="24" font-family="system-ui" font-size="10" font-weight="bold" fill="white" letter-spacing="2">CERTIFIED</text><text x="50" y="42" font-family="system-ui" font-size="14" font-weight="900" fill="white" letter-spacing="1">GREEN BRAND</text><text x="16" y="36" font-size="24">🌿</text></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.companyName.replace(/\s+/g, '-').toLowerCase()}-green-badge.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-black to-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <Leaf className="absolute top-8 right-8 w-48 h-48 text-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-6 h-6 text-green-400" />
            <h2 className="text-3xl font-black tracking-widest uppercase">Green Brand Badge</h2>
          </div>
          <p className="text-stone-400 text-lg">Track your brand's environmental footprint</p>
        </div>
      </div>

      {!greenScore ? (
        <div className="flex items-center justify-center gap-3 py-16 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-bold">Calculating environmental impact...</span>
        </div>
      ) : (
        <>
          {/* Efficiency Rating Circle */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className={`w-40 h-40 rounded-full border-[6px] flex flex-col items-center justify-center bg-gradient-to-br ${RATING_BG[greenScore.efficiencyRating]} ${RATING_COLORS[greenScore.efficiencyRating]}`}
            >
              <span className="text-6xl font-black">{greenScore.efficiencyRating}</span>
              <span className="text-xs font-bold tracking-widest uppercase opacity-70">Rating</span>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm text-center">
              <BarChart3 className="w-6 h-6 text-brand-lavender mx-auto mb-2" />
              <div className="text-3xl font-black text-brand-black">{greenScore.totalApiCalls}</div>
              <span className="font-black text-[10px] tracking-widest uppercase text-stone-400">Total API Calls</span>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm text-center">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-3xl font-black text-brand-black">{greenScore.estimatedKWh}</div>
              <span className="font-black text-[10px] tracking-widest uppercase text-stone-400">Estimated kWh</span>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm text-center">
              <TrendingDown className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-black text-brand-black">{greenScore.carbonOffsetKg}</div>
              <span className="font-black text-[10px] tracking-widest uppercase text-stone-400">Carbon Offset (kg CO2)</span>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm text-center">
              <Award className="w-6 h-6 text-brand-teal mx-auto mb-2" />
              <div className="text-3xl font-black text-brand-black">{greenScore.badgeEligible ? 'Yes' : 'No'}</div>
              <span className="font-black text-[10px] tracking-widest uppercase text-stone-400">Badge Eligible</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-lg">
            <h3 className="font-black text-sm tracking-widest uppercase text-brand-black mb-6">Usage Breakdown</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 text-[10px] font-black tracking-widest uppercase text-stone-400 px-4">
                <span>Service</span>
                <span className="text-center">Calls</span>
                <span className="text-right">Energy (kWh)</span>
              </div>
              {greenScore.breakdown.map((row, i) => (
                <motion.div
                  key={row.service}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="grid grid-cols-3 bg-stone-50 rounded-xl px-4 py-3 text-sm"
                >
                  <span className="font-bold text-brand-black">{row.service}</span>
                  <span className="text-center text-stone-600">{row.calls}</span>
                  <span className="text-right font-mono text-brand-teal">{row.energy}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Badge & Embed Section */}
          {greenScore.badgeEligible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Animated Badge */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-[2.5rem] p-10 text-center border border-green-200">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-2xl shadow-xl">
                    <Leaf className="w-6 h-6" />
                    <span className="font-black tracking-widest uppercase text-lg">Certified Green Brand</span>
                    <Award className="w-6 h-6" />
                  </div>
                </motion.div>
                <p className="mt-4 text-stone-600 text-sm">{input.companyName} — Efficiency Rating {greenScore.efficiencyRating}</p>
                <button
                  onClick={handleDownloadBadge}
                  className="mt-4 bg-brand-black hover:bg-stone-800 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
                >
                  Download Badge SVG
                </button>
              </div>

              {/* Embed Code */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-sm tracking-widest uppercase text-brand-black">Embed Badge</h3>
                  <button
                    onClick={handleCopyEmbed}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-sm font-bold"
                  >
                    {copied ? <><Check className="w-4 h-4 text-green-600" /> Copied</> : <><Leaf className="w-4 h-4 text-stone-600" /> Copy HTML</>}
                  </button>
                </div>
                <pre className="font-mono text-xs bg-stone-50 rounded-xl p-4 overflow-x-auto text-stone-600 whitespace-pre-wrap">
{`<a href="https://xela-elite-ai-creative-studio.vercel.app/green-badge/${input.companyName.toLowerCase().replace(/\s+/g, '-')}" target="_blank">
  <img src="https://xela-elite-ai-creative-studio.vercel.app/badges/green-certified.svg"
       alt="Certified Green Brand - ${input.companyName}" width="180" />
</a>`}
                </pre>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};
