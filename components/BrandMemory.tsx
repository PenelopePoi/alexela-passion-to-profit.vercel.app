import React, { useState, useEffect } from 'react';
import { BrandInput, BrandStrategy, BrandMemoryEntry } from '../types';
import { Brain, Clock, TrendingUp, Loader2, Plus, Trash2, Sparkles, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBrandMemoryInsight } from '../services/geminiService';

interface BrandMemoryProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const TYPE_LABELS: Record<BrandMemoryEntry['type'], { label: string; color: string }> = {
  conversation: { label: 'Conversation', color: 'bg-brand-teal/10 text-brand-teal' },
  asset: { label: 'Asset', color: 'bg-brand-lavender/10 text-brand-lavender' },
  guideline: { label: 'Guideline', color: 'bg-amber-100 text-amber-700' },
  competitor: { label: 'Competitor', color: 'bg-red-50 text-red-600' },
  feedback: { label: 'Feedback', color: 'bg-emerald-50 text-emerald-600' },
};

export const BrandMemory: React.FC<BrandMemoryProps> = ({ input, strategy }) => {
  const [memories, setMemories] = useState<BrandMemoryEntry[]>([]);
  const [insight, setInsight] = useState<{ insight: string; recommendations: string[]; evolutionScore: number; timeline: Array<{ date: string; event: string }> } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newType, setNewType] = useState<BrandMemoryEntry['type']>('conversation');
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');

  const handleAddMemory = () => {
    if (!newContent.trim()) return;
    const entry: BrandMemoryEntry = {
      id: crypto.randomUUID(),
      type: newType,
      content: newContent.trim(),
      timestamp: Date.now(),
      source: newSource.trim() || 'Manual entry',
    };
    setMemories(prev => [entry, ...prev]);
    setNewContent('');
    setNewSource('');
    setShowAddForm(false);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleAnalyze = async () => {
    if (memories.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await generateBrandMemoryInsight(
        input,
        strategy,
        memories.map(m => ({ type: m.type, content: m.content, timestamp: m.timestamp }))
      );
      setInsight(result);
    } catch {
      // silent fail
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sortedMemories = [...memories].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-black to-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <Brain className="absolute top-8 right-8 w-48 h-48 text-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-brand-teal" />
            <h2 className="text-3xl font-black tracking-widest uppercase">Brand Memory Engine</h2>
          </div>
          <p className="text-stone-400 text-lg">Your brand evolves with every interaction</p>
        </div>

        {/* Stats */}
        <div className="mt-8 flex gap-8 relative z-10">
          <div>
            <span className="text-2xl font-black text-brand-teal">{memories.length}</span>
            <p className="text-xs text-stone-400 mt-1 font-black uppercase tracking-widest">Memories</p>
          </div>
          {insight && (
            <div>
              <span className="text-2xl font-black text-brand-lavender">{insight.evolutionScore}</span>
              <p className="text-xs text-stone-400 mt-1 font-black uppercase tracking-widest">Evolution Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex-1 py-4 bg-brand-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || memories.length === 0}
          className="flex-1 py-4 bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-black transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Analyze Evolution</>
          )}
        </button>
      </div>

      {/* Add Memory Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-brand-black">New Memory</h3>

              <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest text-brand-black">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as BrandMemoryEntry['type'])}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-lavender appearance-none"
                >
                  <option value="conversation">Conversation</option>
                  <option value="asset">Asset</option>
                  <option value="guideline">Guideline</option>
                  <option value="competitor">Competitor</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest text-brand-black">Content</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="What happened? What was decided? What did you learn?"
                  rows={4}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-lavender resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest text-brand-black">Source</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={e => setNewSource(e.target.value)}
                  placeholder="e.g., Client meeting, Slack, Email"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-lavender"
                />
              </div>

              <button
                onClick={handleAddMemory}
                disabled={!newContent.trim()}
                className="w-full py-4 bg-brand-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Save Memory
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Timeline */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50">
        <h3 className="font-black text-[10px] uppercase tracking-widest text-brand-black mb-6">Memory Timeline</h3>

        {sortedMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400 gap-3">
            <Brain className="w-10 h-10" />
            <p className="text-sm text-center max-w-md">Start building your brand's memory. Add conversations, decisions, and milestones.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedMemories.map(memory => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-5 border border-stone-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${TYPE_LABELS[memory.type].color}`}>
                        {TYPE_LABELS[memory.type].label}
                      </span>
                      <span className="text-[10px] text-stone-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(memory.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">{memory.content}</p>
                  {memory.source && (
                    <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {memory.source}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Insight Results */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 space-y-6"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand-teal" />
            <h3 className="font-black text-[10px] uppercase tracking-widest text-brand-black">Evolution Analysis</h3>
          </div>

          {/* Evolution Score Circle */}
          <div className="flex items-center gap-8">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-stone-100" />
                <circle
                  cx="48" cy="48" r="40"
                  stroke="currentColor" strokeWidth="6" fill="none"
                  strokeDasharray={`${(insight.evolutionScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="text-brand-teal"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-brand-black">{insight.evolutionScore}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Score</span>
              </div>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{insight.insight}</p>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-brand-black flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-teal" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {insight.recommendations.map((rec, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-stone-100 text-sm text-stone-700 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-teal/10 text-brand-teal text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Visualization */}
          {insight.timeline.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-brand-black flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-lavender" />
                Brand Timeline
              </h4>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-stone-200" />
                {insight.timeline.map((item, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-brand-lavender border-2 border-white" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{item.date}</span>
                      <p className="text-sm text-stone-700">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
