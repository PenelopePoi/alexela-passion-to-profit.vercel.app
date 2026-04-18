import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Clock, ThumbsUp, Plus, Sparkles, Loader2, Star, Award, Share2, AlertCircle } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generateChallengeKit } from '../services/geminiService';

interface ChallengeKit {
  brief: string;
  theme: string;
  criteria: string[];
  exampleEntries: string[];
  judgingRubric: Array<{ criterion: string; weight: number; description: string }>;
  winnerSpotlightCopy: string;
}

interface Submission {
  id: string;
  brandName: string;
  description: string;
  votes: number;
  submittedAt: number;
}

interface SpotlightChallengeProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

export const SpotlightChallenge: React.FC<SpotlightChallengeProps> = ({ input, strategy }) => {
  const [challenge, setChallenge] = useState<ChallengeKit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([
    { id: '1', brandName: 'Sunshine Eats', description: 'A vibrant food truck brand for Miami Beach', votes: 24, submittedAt: Date.now() - 86400000 },
    { id: '2', brandName: 'GlowUp Studios', description: 'Premium beauty salon branding for Tampa', votes: 18, submittedAt: Date.now() - 172800000 },
    { id: '3', brandName: 'OceanBreeze Fitness', description: 'Coastal fitness brand for Jacksonville', votes: 15, submittedAt: Date.now() - 259200000 },
  ]);
  const [activeView, setActiveView] = useState<'leaderboard' | 'submissions'>('leaderboard');
  const [newEntry, setNewEntry] = useState({ brandName: '', description: '' });

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const kit = await generateChallengeKit(
        input.industry || 'creative services',
        input.location || 'Florida'
      );
      setChallenge(kit);
    } catch (err) {
      setError('Failed to generate challenge. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVote = (id: string) => {
    setSubmissions(prev =>
      prev.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s)
    );
  };

  const handleSubmitEntry = () => {
    if (!newEntry.brandName.trim() || !newEntry.description.trim()) return;
    const entry: Submission = {
      id: String(Date.now()),
      brandName: newEntry.brandName.trim(),
      description: newEntry.description.trim(),
      votes: 0,
      submittedAt: Date.now(),
    };
    setSubmissions(prev => [...prev, entry]);
    setNewEntry({ brandName: '', description: '' });
  };

  const handleShare = () => {
    const url = `https://xela.studio/challenge/${challenge?.theme?.toLowerCase().replace(/\s+/g, '-') || 'current'}`;
    navigator.clipboard.writeText(url);
  };

  const sortedSubmissions = [...submissions].sort((a, b) => b.votes - a.votes);

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Award className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Award className="w-5 h-5 text-stone-300" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-brand-lavender" />
          <h2 className="text-4xl font-black tracking-tight">Spotlight Challenge</h2>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          Compete. Create. Get Featured.
        </p>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 text-red-400"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 1: Active Challenge */}
      <motion.section
        layout
        className="bg-gradient-to-br from-brand-lavender/10 to-brand-teal/10 rounded-[3rem] p-10 border border-white/50"
      >
        {!challenge ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <Sparkles className="w-12 h-12 text-brand-lavender opacity-50" />
            <p className="text-stone-400 text-sm">No active challenge yet this month.</p>
            <button
              onClick={handleGenerateChallenge}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-brand-lavender text-white font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Generate This Month's Challenge
                </>
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                This Month's Theme
              </p>
              <h3 className="text-3xl font-black tracking-tight">{challenge.theme}</h3>
              <p className="text-stone-500 leading-relaxed">{challenge.brief}</p>
            </div>

            {/* Criteria Pills */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Submission Criteria
              </p>
              <div className="flex flex-wrap gap-2">
                {challenge.criteria.map((c, i) => (
                  <span
                    key={i}
                    className="bg-white/60 border border-white/80 text-stone-600 text-xs font-semibold px-4 py-2 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Example Entries */}
            {challenge.exampleEntries && challenge.exampleEntries.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Example Entries
                </p>
                <div className="grid gap-2">
                  {challenge.exampleEntries.map((entry, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-stone-500">
                      <Star className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                      <span>{entry}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Judging Rubric */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Judging Rubric
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/40">
                      <th className="text-left px-5 py-3 font-bold text-stone-600">Criterion</th>
                      <th className="text-center px-5 py-3 font-bold text-stone-600 w-24">Weight</th>
                      <th className="text-left px-5 py-3 font-bold text-stone-600">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenge.judgingRubric.map((item, i) => (
                      <tr key={i} className="border-t border-white/40">
                        <td className="px-5 py-3 font-semibold text-stone-700">{item.criterion}</td>
                        <td className="px-5 py-3 text-center text-brand-lavender font-bold">{item.weight}%</td>
                        <td className="px-5 py-3 text-stone-500">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Section 2: Submissions / Leaderboard */}
      <section className="space-y-6">
        {/* Tab Toggle */}
        <div className="flex gap-2 bg-stone-100 rounded-full p-1 w-fit mx-auto">
          {(['leaderboard', 'submissions'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeView === view
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {view === 'leaderboard' ? (
                <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Leaderboard</span>
              ) : (
                <span className="flex items-center gap-2"><Star className="w-4 h-4" /> My Submissions</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'leaderboard' ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {sortedSubmissions.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-stone-100 hover:border-brand-lavender/30 transition-colors"
                >
                  <div className="w-8 text-center">
                    {getMedalIcon(index) || (
                      <span className="text-sm font-bold text-stone-300">#{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-800 truncate">{sub.brandName}</h4>
                    <p className="text-sm text-stone-400 truncate">{sub.description}</p>
                  </div>
                  <button
                    onClick={() => handleVote(sub.id)}
                    className="flex items-center gap-2 bg-stone-50 hover:bg-brand-lavender/10 px-4 py-2 rounded-full transition-colors group"
                  >
                    <ThumbsUp className="w-4 h-4 text-stone-400 group-hover:text-brand-lavender transition-colors" />
                    <span className="text-sm font-bold text-stone-500 group-hover:text-brand-lavender transition-colors">
                      {sub.votes}
                    </span>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Submit Entry Form */}
              <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Submit Entry
                </p>
                <input
                  type="text"
                  value={newEntry.brandName}
                  onChange={e => setNewEntry(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="Brand Name"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-brand-lavender transition-colors"
                />
                <textarea
                  value={newEntry.description}
                  onChange={e => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your brand concept..."
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-brand-lavender transition-colors resize-none"
                />
                <button
                  onClick={handleSubmitEntry}
                  disabled={!newEntry.brandName.trim() || !newEntry.description.trim()}
                  className="flex items-center gap-2 bg-brand-teal text-white font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  Submit Entry
                </button>
              </div>

              {/* User's Submissions */}
              {submissions.filter(s => s.submittedAt > Date.now() - 300000).length > 0 && (
                <div className="space-y-3">
                  {submissions
                    .filter(s => s.submittedAt > Date.now() - 300000)
                    .map(sub => (
                      <div
                        key={sub.id}
                        className="bg-white rounded-2xl p-5 border border-stone-100"
                      >
                        <h4 className="font-bold text-stone-800">{sub.brandName}</h4>
                        <p className="text-sm text-stone-400 mt-1">{sub.description}</p>
                        <p className="text-xs text-stone-300 mt-2">{sub.votes} votes</p>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section 3: Hall of Fame */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-brand-black rounded-[3rem] p-10 text-white space-y-6"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Hall of Fame
          </p>
        </div>

        {challenge?.winnerSpotlightCopy ? (
          <p className="text-stone-300 leading-relaxed">
            {challenge.winnerSpotlightCopy}
          </p>
        ) : (
          <p className="text-stone-500 text-sm">
            Generate a challenge to see the winner spotlight template.
          </p>
        )}

        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-full transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Your Entry
        </button>
      </motion.section>
    </motion.div>
  );
};
