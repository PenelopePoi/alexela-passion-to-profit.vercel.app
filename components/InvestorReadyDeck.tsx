import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Lightbulb,
  BarChart3,
  DollarSign,
  Rocket,
  Shield,
  Target,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generatePitchDeck, PitchDeck } from '../services/geminiService';

interface InvestorReadyDeckProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const slideConfig = [
  { key: 'problem', title: 'Problem', accent: '#ef4444', icon: AlertTriangle },
  { key: 'solution', title: 'Solution', accent: '#22c55e', icon: Lightbulb },
  { key: 'market', title: 'Market Size', accent: '#3b82f6', icon: BarChart3 },
  { key: 'revenue', title: 'Revenue Model', accent: '#14b8a6', icon: DollarSign },
  { key: 'traction', title: 'Traction Signals', accent: '#a78bfa', icon: TrendingUp },
  { key: 'moat', title: 'Competitive Moat', accent: '#1c1917', icon: Shield },
] as const;

const getScoreColor = (score: number) => {
  if (score < 40) return '#ef4444';
  if (score <= 70) return '#eab308';
  return '#22c55e';
};

export const InvestorReadyDeck: React.FC<InvestorReadyDeckProps> = ({
  input,
  strategy,
}) => {
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePitchDeck(input, strategy);
      setDeck(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const circumference = 2 * Math.PI * 54;
  const scoreOffset = deck
    ? circumference - (deck.investorReadinessScore / 100) * circumference
    : circumference;

  const renderCardContent = (index: number) => {
    if (!deck) return null;
    switch (index) {
      case 0:
        return <p className="text-stone-600 text-sm leading-relaxed">{deck.problemStatement}</p>;
      case 1:
        return <p className="text-stone-600 text-sm leading-relaxed">{deck.solutionStatement}</p>;
      case 2:
        return (
          <div className="space-y-3 mt-2">
            {[
              { label: 'TAM', value: deck.marketSize?.tam, width: 'w-full' },
              { label: 'SAM', value: deck.marketSize?.sam, width: 'w-3/4' },
              { label: 'SOM', value: deck.marketSize?.som, width: 'w-1/2' },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-blue-500 rounded-full ${bar.width}`}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 3:
        return <p className="text-stone-600 text-sm leading-relaxed">{deck.revenueModel}</p>;
      case 4:
        return (
          <ul className="space-y-2 mt-1">
            {deck.tractionSignals?.map((signal, i) => (
              <li key={i} className="flex items-start gap-2 text-stone-600 text-sm">
                <Target className="w-4 h-4 mt-0.5 text-brand-lavender shrink-0" />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        );
      case 5:
        return <p className="text-stone-600 text-sm leading-relaxed">{deck.competitiveMoat}</p>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Rocket className="w-6 h-6 text-brand-lavender" />
            <h2 className="text-2xl font-black tracking-tight">Investor Ready</h2>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            AI-Generated Pitch Deck & Readiness Score
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-brand-black text-white rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            'Generate Pitch Deck'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Pitch Deck Cards */}
      {deck && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slideConfig.map((slide, i) => {
              const Icon = slide.icon;
              return (
                <motion.div
                  key={slide.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                >
                  <div
                    className="h-1 -mx-8 -mt-8 mb-6"
                    style={{ backgroundColor: slide.accent }}
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-5 h-5" style={{ color: slide.accent }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                      Slide {i + 1}
                    </span>
                    <span className="text-sm font-black tracking-tight">{slide.title}</span>
                  </div>
                  {renderCardContent(i)}
                </motion.div>
              );
            })}
          </div>

          {/* Investor Readiness Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-brand-black rounded-[3rem] p-12 text-white"
          >
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* SVG Gauge */}
              <div className="relative shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={getScoreColor(deck.investorReadinessScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: scoreOffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-3xl font-black"
                    style={{ color: getScoreColor(deck.investorReadinessScore) }}
                  >
                    {deck.investorReadinessScore}
                  </span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                    Investor Readiness Score
                  </h3>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    {deck.scoreReasoning}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">
                    Improvements
                  </h4>
                  <ul className="space-y-2">
                    {deck.improvements?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-stone-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-brand-lavender shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ask & Use */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-brand-lavender/10 rounded-[2rem] p-8 border border-brand-lavender/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-brand-lavender" />
              <h3 className="text-sm font-black tracking-tight">The Ask & Use of Funds</h3>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">{deck.askAndUse}</p>
          </motion.div>
        </>
      )}
    </div>
  );
};
