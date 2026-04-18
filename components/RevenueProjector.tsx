import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Target, ArrowUpRight, BarChart3, Loader2, Zap, AlertCircle } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generateRevenueProjection, RevenueProjection } from '../services/geminiService';

interface RevenueProjectorProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const TIER_DEFAULTS: Record<string, number> = {
  Budget: 149,
  Premium: 399,
  Elite: 899,
};

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const RevenueProjector: React.FC<RevenueProjectorProps> = ({ input, strategy }) => {
  const [tier, setTier] = useState<'Budget' | 'Premium' | 'Elite'>('Premium');
  const [price, setPrice] = useState(399);
  const [clientGoal, setClientGoal] = useState(10);
  const [projection, setProjection] = useState<RevenueProjection | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTierChange = (newTier: 'Budget' | 'Premium' | 'Elite') => {
    setTier(newTier);
    setPrice(TIER_DEFAULTS[newTier]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateRevenueProjection(
        tier,
        price,
        input.industry,
        input.location,
        clientGoal
      );
      setProjection(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const maxRevenue = projection?.monthlyRevenue ? Math.max(...projection.monthlyRevenue) : 0;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel — Input Controls */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 flex flex-col gap-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6 text-brand-teal" />
          <h3 className="font-black text-[10px] uppercase tracking-widest text-brand-black">Revenue Projector</h3>
        </div>

        {/* Tier Selector */}
        <div>
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black/60 mb-2 block">
            Package Tier
          </label>
          <div className="flex gap-2">
            {(['Budget', 'Premium', 'Elite'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleTierChange(t)}
                className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  tier === t
                    ? t === 'Elite'
                      ? 'bg-brand-black text-white'
                      : 'bg-brand-teal text-white'
                    : 'bg-white/60 text-brand-black/50 hover:bg-white/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black/60 mb-2 block">
            Package Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black/30" />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-white/60 rounded-2xl py-3 pl-10 pr-4 text-brand-black font-semibold border border-white/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
          </div>
        </div>

        {/* Industry (auto-filled) */}
        <div>
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black/60 mb-2 block">
            Industry
          </label>
          <div className="bg-white/60 rounded-2xl py-3 px-4 text-brand-black/70 border border-white/50">
            {input.industry || 'Not specified'}
          </div>
        </div>

        {/* Location (auto-filled) */}
        <div>
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black/60 mb-2 block">
            Location
          </label>
          <div className="bg-white/60 rounded-2xl py-3 px-4 text-brand-black/70 border border-white/50">
            {input.location || 'Not specified'}
          </div>
        </div>

        {/* Monthly Client Goal */}
        <div>
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black/60 mb-2 block">
            Monthly Client Goal
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={50}
              value={clientGoal}
              onChange={(e) => setClientGoal(Number(e.target.value))}
              className="flex-1 accent-brand-teal"
            />
            <span className="font-black text-brand-teal text-lg min-w-[2.5rem] text-right">
              {clientGoal}
            </span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 py-4 hover:scale-105 transition-all disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Projecting...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Project Revenue
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </motion.div>

      {/* Right Panel — Results */}
      {projection && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          {/* ROI Multiplier Hero */}
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 text-center">
            <p className="font-black text-[10px] uppercase tracking-widest text-brand-black/60 mb-2">
              ROI Multiplier
            </p>
            <motion.p
              animate={{ scale: [0.5, 1.1, 1] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-6xl font-black text-brand-teal"
            >
              {projection.roiMultiplier}
            </motion.p>

            {/* Break-even Badge */}
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 text-green-600 rounded-full px-4 py-2 text-sm font-semibold">
              <Target className="w-4 h-4" />
              Break-even in Month {projection.breakEvenMonth}
            </div>
          </div>

          {/* 12-Month Revenue Chart — Pure SVG */}
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-brand-teal" />
              <h4 className="font-black text-[10px] uppercase tracking-widest text-brand-black/60">
                12-Month Revenue Projection
              </h4>
            </div>
            <svg viewBox="0 0 480 200" className="w-full" preserveAspectRatio="xMidYMid meet">
              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                const y = 170 - frac * 150;
                const val = Math.round(maxRevenue * frac);
                return (
                  <g key={i}>
                    <line x1="50" y1={y} x2="470" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
                    <text x="46" y={y + 4} textAnchor="end" className="text-[8px]" fill="#9ca3af">
                      ${val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {projection?.monthlyRevenue?.map((rev, i) => {
                const barWidth = 28;
                const gap = (420 - 12 * barWidth) / 11;
                const x = 55 + i * (barWidth + gap);
                const height = maxRevenue > 0 ? (rev / maxRevenue) * 150 : 0;
                const y = 170 - height;
                const isBreakEven = i + 1 === projection.breakEvenMonth;

                return (
                  <g key={i}>
                    <motion.rect
                      initial={{ height: 0, y: 170 }}
                      animate={{ height, y }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                      x={x}
                      width={barWidth}
                      rx={4}
                      fill={isBreakEven ? '#22c55e' : 'var(--color-brand-teal, #2dd4bf)'}
                      opacity={0.85}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={185}
                      textAnchor="middle"
                      className="text-[8px]"
                      fill="#6b7280"
                    >
                      {MONTH_LABELS[i]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Upsell Nudge */}
          {projection.upsellTrigger && (
            <div className="bg-brand-lavender/10 border border-brand-lavender/20 rounded-2xl p-4 flex items-start gap-3">
              <Zap className="w-5 h-5 text-brand-lavender shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest text-brand-black/60 mb-1">
                  Upsell Opportunity
                </p>
                <p className="text-sm text-brand-black/70">{projection.upsellTrigger}</p>
              </div>
            </div>
          )}

          {/* Assumptions */}
          {projection.assumptions && projection.assumptions.length > 0 && (
            <div className="px-2">
              <p className="font-black text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">
                Assumptions
              </p>
              <ul className="space-y-1">
                {projection.assumptions.map((a, i) => (
                  <li key={i} className="text-xs text-brand-black/40 flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-brand-black/20 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Competitor Benchmark */}
          {projection.competitorBenchmark && (
            <div className="px-2 flex items-center gap-2 text-xs text-brand-black/50">
              <ArrowUpRight className="w-3.5 h-3.5 text-brand-teal" />
              {projection.competitorBenchmark}
            </div>
          )}

          {/* Bottom CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 py-5 flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20"
          >
            <DollarSign className="w-4 h-4" />
            Lock In This Package
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};
