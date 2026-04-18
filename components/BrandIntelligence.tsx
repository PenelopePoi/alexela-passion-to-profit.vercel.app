
import React, { useState } from 'react';
import { BrandInput, BrandStrategy, CompetitorAnalysis, BrandVoiceAnalysis } from '../types';
import { analyzeCompetitor, analyzeBrandVoice, generateImageNanoBanana2 } from '../services/geminiService';
import { Search, Globe, MessageSquare, Sparkles, Loader2, TrendingUp, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BrandIntelligenceProps {
  input: BrandInput;
  strategy: BrandStrategy;
  onUpdateStrategy: (updates: Partial<BrandStrategy>) => void;
}

export const BrandIntelligence: React.FC<BrandIntelligenceProps> = ({ input, strategy, onUpdateStrategy }) => {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [voiceSample, setVoiceSample] = useState('');
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [isGeneratingStoryImages, setIsGeneratingStoryImages] = useState(false);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl.trim()) return;
    setIsAnalyzingCompetitor(true);
    setError(null);
    try {
      const analysis = await analyzeCompetitor(input, competitorUrl);
      const updatedAnalyses = [...(strategy.competitorAnalyses || []), analysis];
      onUpdateStrategy({ competitorAnalyses: updatedAnalyses });
      setCompetitorUrl('');
    } catch (err) {
      setError('Failed to analyze competitor. Please check the URL.');
      console.error(err);
    } finally {
      setIsAnalyzingCompetitor(false);
    }
  };

  const handleAnalyzeVoice = async () => {
    if (!voiceSample.trim()) return;
    setIsAnalyzingVoice(true);
    setError(null);
    try {
      const analysis = await analyzeBrandVoice(voiceSample);
      onUpdateStrategy({ voiceAnalysis: analysis });
      setVoiceSample('');
    } catch (err) {
      setError('Failed to analyze brand voice.');
      console.error(err);
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const handleGenerateStoryImages = async () => {
    setIsGeneratingStoryImages(true);
    setError(null);
    try {
      const prompts = [
        `Cinematic brand story image for ${input.companyName}: The Origin. Vibe: ${input.vibe}.`,
        `Cinematic brand story image for ${input.companyName}: The Mission. Vibe: ${input.vibe}.`,
        `Cinematic brand story image for ${input.companyName}: The Future. Vibe: ${input.vibe}.`
      ];
      const images = await Promise.all(prompts.map(p => generateImageNanoBanana2(p)));
      setStoryImages(images);
    } catch (err) {
      setError('Failed to generate story images.');
      console.error(err);
    } finally {
      setIsGeneratingStoryImages(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-black tracking-tighter mb-2">Brand Intelligence</h2>
          <p className="text-stone-500 font-medium max-w-2xl">
            Leverage AI-powered tools to analyze competitors, refine your brand voice, and visualize your narrative.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-teal/10 rounded-full border border-brand-teal/20">
          <Sparkles size={16} className="text-brand-teal" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">AI-Powered Insights</span>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Competitor Analysis */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
              <Globe className="text-brand-teal" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-black tracking-tight">Competitor Analysis</h3>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">Market Intelligence</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="url"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor.com"
                className="w-full px-6 py-4 bg-stone-50 rounded-2xl border border-stone-100 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 outline-none transition-all text-xs font-medium"
              />
              <button 
                onClick={handleAnalyzeCompetitor}
                disabled={isAnalyzingCompetitor || !competitorUrl.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-brand-teal text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-black transition-all disabled:opacity-50"
              >
                {isAnalyzingCompetitor ? <Loader2 size={14} className="animate-spin" /> : 'Analyze'}
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {strategy.competitorAnalyses?.map((analysis, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-brand-black">{analysis.competitorName}</h4>
                    <a href={analysis.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-brand-teal hover:underline">Visit Site</a>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-green-600 mb-2">Strengths</p>
                      <ul className="text-xs text-stone-600 space-y-1">
                        {analysis.strengths.map((s, i) => <li key={i} className="flex items-start gap-2">• {s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-red-600 mb-2">Weaknesses</p>
                      <ul className="text-xs text-stone-600 space-y-1">
                        {analysis.weaknesses.map((w, i) => <li key={i} className="flex items-start gap-2">• {w}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-stone-200">
                    <p className="text-[10px] font-black uppercase text-brand-teal mb-2">Edge Strategy</p>
                    <p className="text-xs text-stone-600 leading-relaxed italic">"{analysis.differentiation}"</p>
                  </div>
                </motion.div>
              ))}
              {(!strategy.competitorAnalyses || strategy.competitorAnalyses.length === 0) && (
                <div className="text-center py-12 text-stone-400">
                  <Globe size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium">No competitor analyses yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brand Voice Analysis */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-brand-lavender/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="text-brand-lavender" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-black tracking-tight">Voice Analysis</h3>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">Tone & Style</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Paste Sample Text</label>
              <textarea 
                value={voiceSample}
                onChange={(e) => setVoiceSample(e.target.value)}
                placeholder="Paste an email, blog post, or social media caption that represents your brand voice..."
                className="w-full h-32 px-6 py-4 bg-stone-50 rounded-2xl border border-stone-100 focus:border-brand-lavender focus:ring-4 focus:ring-brand-lavender/10 outline-none transition-all text-xs font-medium resize-none"
              />
            </div>
            <button 
              onClick={handleAnalyzeVoice}
              disabled={isAnalyzingVoice || !voiceSample.trim()}
              className="w-full py-4 bg-brand-lavender text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzingVoice ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Extract Brand Voice
            </button>

            <AnimatePresence mode="wait">
              {strategy.voiceAnalysis ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 bg-brand-lavender/5 rounded-3xl border border-brand-lavender/10 space-y-6"
                >
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase text-brand-lavender mb-2">Tone</p>
                      <p className="text-sm font-black text-brand-black">{strategy.voiceAnalysis.tone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-brand-lavender mb-2">Style</p>
                      <p className="text-sm font-black text-brand-black">{strategy.voiceAnalysis.style}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand-lavender mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.voiceAnalysis.keywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-brand-lavender border border-brand-lavender/10">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand-lavender mb-2">Sample Phrases</p>
                    <div className="space-y-2">
                      {strategy.voiceAnalysis.samplePhrases.map((p, i) => (
                        <p key={i} className="text-xs text-stone-600 italic leading-relaxed">"{p}"</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-stone-400">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium">No voice analysis yet.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Brand Story Visualizer */}
      <div className="glass-card p-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
              <ImageIcon className="text-brand-orange" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-brand-black tracking-tight">Brand Story Visualizer</h3>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">Visual Narrative</p>
            </div>
          </div>
          <button 
            onClick={handleGenerateStoryImages}
            disabled={isGeneratingStoryImages}
            className="px-8 py-4 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGeneratingStoryImages ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Visualize Brand Story
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isGeneratingStoryImages ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-stone-100 animate-pulse rounded-3xl flex items-center justify-center">
                <Loader2 className="text-stone-300 animate-spin" size={32} />
              </div>
            ))
          ) : storyImages.length > 0 ? (
            storyImages.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
              >
                <img 
                  src={img} 
                  alt={`Brand Story ${i + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <p className="text-white font-black text-lg uppercase tracking-tighter">
                    {i === 0 ? 'The Origin' : i === 1 ? 'The Mission' : 'The Future'}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 py-24 text-center text-stone-300">
              <ImageIcon size={64} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg font-medium">Click visualize to generate your brand story images</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
