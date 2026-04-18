import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, Shuffle, Info, X, Check, Sparkles } from 'lucide-react';
import { INTAKE_VARIANTS, IntakeVariantRenderer } from './IntakeVariants';
import type { IntakeVariant } from './IntakeVariants';
import type { BrandInput } from '../types';

interface IntakeShufflerProps {
  onComplete: (data: Partial<BrandInput>) => void;
  onSaveDraft?: (data: Partial<BrandInput>) => void;
}

interface VariantStats {
  id: number;
  score: number;
  timesSeen: number;
  timesLiked: number;
  isMutation?: boolean;
  parentId?: number;
  traits: string[];
}

const STATS_KEY = 'xela_intake_stats';
const CURRENT_KEY = 'xela_intake_current';
const LEGACY_KEY = 'xela_intake_preferences';

function getVariantTraits(v: { name: string }): string[] {
  const name = v.name.toLowerCase();
  const traits: string[] = [];
  if (name.includes('chat') || name.includes('bot')) traits.push('conversational');
  if (name.includes('visual') || name.includes('mood') || name.includes('sticker') || name.includes('comic') || name.includes('dating')) traits.push('visual');
  if (name.includes('terminal') || name.includes('minimal')) traits.push('text-heavy');
  if (name.includes('quiz') || name.includes('speed') || name.includes('buzz')) traits.push('rapid');
  if (name.includes('postcard') || name.includes('journal') || name.includes('letter') || name.includes('storybook')) traits.push('narrative');
  if (name.includes('classic') || name.includes('wizard') || name.includes('step')) traits.push('traditional');
  if (name.includes('launch') || name.includes('countdown') || name.includes('sequence') || name.includes('horoscope') || name.includes('concert') || name.includes('menu') || name.includes('voice')) traits.push('themed');
  return traits.length > 0 ? traits : ['other'];
}

function loadStats(): VariantStats[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
    // Legacy migration
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const { liked = [], disliked = [] } = JSON.parse(legacy);
      const stats: VariantStats[] = INTAKE_VARIANTS.map(v => ({
        id: v.id,
        score: liked.includes(v.id) ? 3 : disliked.includes(v.id) ? -Infinity : 1,
        timesSeen: liked.includes(v.id) || disliked.includes(v.id) ? 1 : 0,
        timesLiked: liked.includes(v.id) ? 1 : 0,
        traits: getVariantTraits(v),
      }));
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      localStorage.removeItem(LEGACY_KEY);
      return stats;
    }
  } catch {}
  return [];
}

function saveStats(stats: VariantStats[]) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

function ensureStat(stats: VariantStats[], id: number): VariantStats {
  let stat = stats.find(s => s.id === id);
  if (!stat) {
    const variant = INTAKE_VARIANTS.find(v => v.id === id);
    stat = {
      id,
      score: 1,
      timesSeen: 0,
      timesLiked: 0,
      traits: variant ? getVariantTraits(variant) : ['other'],
    };
    stats.push(stat);
  }
  return stat;
}

function pickWeighted(stats: VariantStats[], exclude: number | null = null): number {
  const available = INTAKE_VARIANTS.filter(v => {
    const stat = stats.find(s => s.id === v.id);
    return (!stat || stat.score !== -Infinity) && v.id !== exclude;
  });
  if (available.length === 0) {
    return INTAKE_VARIANTS[Math.floor(Math.random() * INTAKE_VARIANTS.length)].id;
  }
  const weighted: number[] = [];
  available.forEach(v => {
    const stat = stats.find(s => s.id === v.id);
    const weight = Math.max(1, Math.floor((stat?.score || 1) * 2));
    for (let i = 0; i < weight; i++) weighted.push(v.id);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function generateMutation(dislikedId: number, stats: VariantStats[]): number {
  const disliked = stats.find(s => s.id === dislikedId);
  if (!disliked) return pickWeighted(stats, dislikedId);

  const dislikedTraits = disliked.traits;
  const unseen = INTAKE_VARIANTS.filter(v => {
    const stat = stats.find(s => s.id === v.id);
    return (!stat || stat.timesSeen === 0) && v.id !== dislikedId;
  });

  if (unseen.length > 0) {
    const differentTraits = unseen.filter(v => {
      const traits = getVariantTraits(v);
      return traits.every(t => !dislikedTraits.includes(t));
    });
    const pool = differentTraits.length > 0 ? differentTraits : unseen;
    return pool[Math.floor(Math.random() * pool.length)].id;
  }

  return pickWeighted(stats, dislikedId);
}

function detectPattern(stats: VariantStats[]): string | null {
  const liked = stats.filter(s => s.timesLiked > 0);
  const rated = stats.filter(s => s.timesSeen > 0);
  if (rated.length < 5) return null;

  const traitCounts: Record<string, number> = {};
  liked.forEach(s => {
    const variant = INTAKE_VARIANTS.find(v => v.id === s.id);
    if (variant) {
      getVariantTraits(variant).forEach(t => {
        traitCounts[t] = (traitCounts[t] || 0) + 1;
      });
    }
  });

  const sorted = Object.entries(traitCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0 || sorted[0][1] < 2) return null;

  const insights: Record<string, string> = {
    'conversational': 'You prefer chat-style intake — friendly, back-and-forth conversations.',
    'visual': 'You love visual, image-rich experiences — mood boards, stickers, comic panels.',
    'text-heavy': 'You prefer clean, text-focused interfaces — terminal, minimalist, direct.',
    'rapid': 'You like fast, high-energy intake — quizzes, speed rounds, buzzer-style.',
    'narrative': 'You connect with storytelling formats — postcards, journals, letters.',
    'traditional': 'You prefer classic, well-structured forms — wizards, clean steps.',
    'themed': 'You love creative themed experiences — launch sequences, horoscopes, festivals.',
  };

  return insights[sorted[0][0]] || null;
}

export function getShufflerLearning() {
  const stats = loadStats();
  return {
    stats,
    pattern: detectPattern(stats),
    totalInteractions: stats.reduce((sum, s) => sum + s.timesSeen, 0),
  };
}

export const IntakeShuffler: React.FC<IntakeShufflerProps> = ({ onComplete, onSaveDraft }) => {
  const [stats, setStats] = useState<VariantStats[]>(() => loadStats());
  const [currentVariantId, setCurrentVariantId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_KEY);
      if (saved) {
        const id = parseInt(saved, 10);
        const initial = loadStats();
        const stat = initial.find(s => s.id === id);
        if (Number.isFinite(id) && INTAKE_VARIANTS.some(v => v.id === id) && (!stat || stat.score !== -Infinity)) {
          return id;
        }
      }
    } catch {}
    return pickWeighted(loadStats());
  });
  const [showInfo, setShowInfo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const patternInsight = useMemo(() => detectPattern(stats), [stats]);
  const totalInteractions = useMemo(
    () => stats.reduce((sum, s) => sum + s.timesSeen, 0),
    [stats]
  );

  // Persist current variant
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_KEY, String(currentVariantId));
    } catch {
      /* ignore */
    }
  }, [currentVariantId]);

  const flashToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1600);
  }, []);

  const currentVariant: IntakeVariant | undefined = INTAKE_VARIANTS.find(
    (v) => v.id === currentVariantId
  );

  const handleKeep = useCallback(() => {
    setStats(prev => {
      const next = prev.map(s => ({ ...s }));
      const stat = ensureStat(next, currentVariantId);
      stat.score += 2;
      stat.timesLiked += 1;
      stat.timesSeen += 1;
      saveStats(next);
      return next;
    });
    flashToast(`Loved it! ${currentVariant?.name ?? ''}`);
  }, [currentVariantId, currentVariant, flashToast]);

  const handleTryAnother = useCallback(() => {
    setStats(prev => {
      const next = prev.map(s => ({ ...s }));
      const stat = ensureStat(next, currentVariantId);
      stat.score = -Infinity;
      stat.timesSeen += 1;
      saveStats(next);
      const newId = generateMutation(currentVariantId, next);
      setCurrentVariantId(newId);
      try { localStorage.setItem(CURRENT_KEY, String(newId)); } catch {}
      const target = INTAKE_VARIANTS.find(v => v.id === newId);
      if (target) flashToast(`Trying: ${target.name}`);
      return next;
    });
  }, [currentVariantId, flashToast]);

  const handleShuffle = useCallback(() => {
    setStats(prev => {
      const next = prev.map(s => ({ ...s }));
      const stat = ensureStat(next, currentVariantId);
      stat.score = Math.max(0.1, stat.score - 0.3);
      stat.timesSeen += 1;
      saveStats(next);
      const newId = pickWeighted(next, currentVariantId);
      setCurrentVariantId(newId);
      try { localStorage.setItem(CURRENT_KEY, String(newId)); } catch {}
      const target = INTAKE_VARIANTS.find(v => v.id === newId);
      if (target) flashToast(`Shuffled to: ${target.name}`);
      return next;
    });
  }, [currentVariantId, flashToast]);

  const handleJumpTo = useCallback(
    (id: number) => {
      const stat = stats.find(s => s.id === id);
      if (stat && stat.score === -Infinity) return;
      const target = INTAKE_VARIANTS.find((v) => v.id === id);
      if (!target) return;
      setCurrentVariantId(id);
      flashToast(`Loading variant ${id}: ${target.name}`);
      setShowInfo(false);
    },
    [stats, flashToast]
  );

  if (!currentVariant) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
        <p>No variant available.</p>
      </div>
    );
  }

  const likedCount = stats.filter(s => s.timesLiked > 0).length;
  const dislikedCount = stats.filter(s => s.score === -Infinity).length;

  return (
    <div className="min-h-screen bg-brand-black text-white">
      {/* Pattern insight banner */}
      <AnimatePresence>
        {patternInsight && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-brand-lavender/10 border border-brand-lavender/30 rounded-2xl p-4 mt-4 max-w-2xl mx-auto text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-lavender mb-1">Pattern Detected</p>
            <p className="text-sm text-white/80 font-medium">{patternInsight}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0" aria-hidden>
              {currentVariant.emoji}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate flex items-center gap-2 flex-wrap">
                <span>{currentVariant.name}</span>
                <span className="text-white/40 font-normal">#{currentVariant.id}</span>
                {totalInteractions > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-lavender/20 text-brand-lavender border border-brand-lavender/30 font-black uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Learning
                  </span>
                )}
              </div>
              <div className="text-xs text-white/60 truncate">"{currentVariant.description}"</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleKeep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-teal-400/20 border border-white/10 hover:border-teal-400/40 text-xs text-white/90 transition"
              title="Keep this variant"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Keep
            </button>
            <button
              onClick={handleTryAnother}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-400/20 border border-white/10 hover:border-rose-400/40 text-xs text-white/90 transition"
              title="Dislike and try another"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Try Another
            </button>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-400/20 border border-white/10 hover:border-purple-400/40 text-xs text-white/90 transition"
              title="Shuffle to a new variant"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle
            </button>
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 transition"
              title="View all variants"
            >
              <Info className="w-3.5 h-3.5" />
              Info
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs text-white/90 shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variant body */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVariantId}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <IntakeVariantRenderer
              variantId={currentVariantId}
              onComplete={onComplete}
              onSaveDraft={onSaveDraft}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-brand-black border border-white/10 rounded-[2rem] p-6 md:p-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-semibold">All Intake Variants</h2>
                  <p className="text-xs text-white/50 mt-1">
                    Click any variant to jump to it. {likedCount} liked · {dislikedCount} disliked · {totalInteractions} interactions
                  </p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {patternInsight && (
                <div className="mb-5 bg-brand-lavender/10 border border-brand-lavender/30 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-lavender mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Pattern Detected
                  </p>
                  <p className="text-sm text-white/80 font-medium">{patternInsight}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTAKE_VARIANTS.map((v) => {
                  const stat = stats.find(s => s.id === v.id);
                  const isLiked = (stat?.timesLiked ?? 0) > 0;
                  const isDisliked = stat?.score === -Infinity;
                  const isCurrent = v.id === currentVariantId;
                  const timesSeen = stat?.timesSeen ?? 0;
                  const timesLiked = stat?.timesLiked ?? 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleJumpTo(v.id)}
                      disabled={isDisliked}
                      className={`text-left p-4 rounded-2xl border transition flex gap-3 items-start ${
                        isDisliked
                          ? 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
                          : isCurrent
                          ? 'bg-teal-400/10 border-teal-400/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl shrink-0" aria-hidden>
                        {v.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold truncate">{v.name}</span>
                          <span className="text-[10px] text-white/40">#{v.id}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              Active
                            </span>
                          )}
                          {isLiked && !isDisliked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                              <ThumbsUp className="w-2.5 h-2.5" />
                              Liked
                            </span>
                          )}
                          {isDisliked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-400/20 text-rose-200 border border-rose-400/30 flex items-center gap-1">
                              <ThumbsDown className="w-2.5 h-2.5" />
                              Disliked
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/60 mt-1 line-clamp-2">
                          {v.description}
                        </div>
                        {timesSeen > 0 && (
                          <div className="text-[10px] text-white/40 mt-2 font-mono">
                            seen {timesSeen}× · liked {timesLiked}×
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntakeShuffler;
