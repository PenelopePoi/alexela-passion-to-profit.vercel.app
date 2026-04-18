import React, { useState } from 'react';
import { BrandInput, BrandStrategy, SpokespersonConfig } from '../types';
import { Video, Sparkles, Play, Loader2, Users, Palette, Film, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { generateSpokespersonScript } from '../services/geminiService';

interface BrandSpokespersonProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

type StyleOption = SpokespersonConfig['style'];

const STYLE_OPTIONS: Array<{ key: StyleOption; label: string; icon: React.ReactNode; description: string }> = [
  { key: 'professional', label: 'Professional', icon: <Users className="w-5 h-5" />, description: 'Polished, corporate, confident' },
  { key: 'friendly', label: 'Friendly', icon: <Sparkles className="w-5 h-5" />, description: 'Warm, approachable, conversational' },
  { key: 'energetic', label: 'Energetic', icon: <Play className="w-5 h-5" />, description: 'Bold, dynamic, high-energy' },
  { key: 'luxury', label: 'Luxury', icon: <Palette className="w-5 h-5" />, description: 'Elegant, refined, exclusive' },
];

export const BrandSpokesperson: React.FC<BrandSpokespersonProps> = ({ input, strategy }) => {
  const [persona, setPersona] = useState<SpokespersonConfig>({
    id: crypto.randomUUID(),
    personaName: '',
    style: 'professional',
    avatarDescription: '',
    scriptTone: strategy.brandVoice || '',
    generatedVideos: [],
  });
  const [scriptResult, setScriptResult] = useState<{ script: string; musicDirection: string; visualNotes: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSpokespersonScript(input, strategy, persona);
      setScriptResult(result);
    } catch {
      // silent fail
    } finally {
      setIsGenerating(false);
    }
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
        <Video className="absolute top-8 right-8 w-48 h-48 text-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Video className="w-6 h-6 text-brand-teal" />
            <h2 className="text-3xl font-black tracking-widest uppercase">AI Spokesperson</h2>
          </div>
          <p className="text-stone-400 text-lg">Your brand's virtual ambassador</p>
        </div>
      </div>

      {/* Persona Builder */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 space-y-6">
        <h3 className="font-black text-[10px] uppercase tracking-widest text-brand-black">Persona Builder</h3>

        {/* Name Input */}
        <div className="space-y-2">
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black">Persona Name</label>
          <input
            type="text"
            value={persona.personaName}
            onChange={e => setPersona(prev => ({ ...prev, personaName: e.target.value }))}
            placeholder="e.g., Alex, your brand ambassador"
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-lavender"
          />
        </div>

        {/* Style Selector */}
        <div className="space-y-3">
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black">Presentation Style</label>
          <div className="grid grid-cols-2 gap-4">
            {STYLE_OPTIONS.map(opt => (
              <motion.button
                key={opt.key}
                whileHover={{ scale: 1.02 }}
                onClick={() => setPersona(prev => ({ ...prev, style: opt.key }))}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  persona.style === opt.key
                    ? 'bg-brand-black text-white border-brand-black shadow-lg'
                    : 'bg-white border-stone-100 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={persona.style === opt.key ? 'text-brand-teal' : 'text-stone-400'}>{opt.icon}</div>
                  <span className="font-black text-sm">{opt.label}</span>
                </div>
                <p className={`text-xs ${persona.style === opt.key ? 'text-stone-300' : 'text-stone-400'}`}>{opt.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Avatar Description */}
        <div className="space-y-2">
          <label className="font-black text-[10px] uppercase tracking-widest text-brand-black">Avatar Description</label>
          <textarea
            value={persona.avatarDescription}
            onChange={e => setPersona(prev => ({ ...prev, avatarDescription: e.target.value }))}
            placeholder="Describe the appearance, clothing, background, and energy of your spokesperson..."
            rows={4}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-lavender resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateScript}
          disabled={isGenerating || !persona.personaName.trim()}
          className="w-full py-4 bg-brand-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating Script...</>
          ) : scriptResult ? (
            <><RefreshCw className="w-4 h-4" /> Regenerate Script</>
          ) : (
            <><Film className="w-4 h-4" /> Generate Script</>
          )}
        </button>
      </div>

      {/* Script Preview */}
      {scriptResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-brand-black">Script Preview</h3>
            <span className="bg-brand-lavender/20 text-brand-lavender text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              {persona.style}
            </span>
          </div>

          {/* Script Text */}
          <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Film className="w-3 h-3" />
                <span className="font-black uppercase tracking-widest">Spoken Script</span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{scriptResult.script}</p>
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Sparkles className="w-3 h-3" />
                <span className="font-black uppercase tracking-widest">Music Direction</span>
              </div>
              <p className="text-sm text-stone-600">{scriptResult.musicDirection}</p>
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Video className="w-3 h-3" />
                <span className="font-black uppercase tracking-widest">Visual Notes</span>
              </div>
              <p className="text-sm text-stone-600">{scriptResult.visualNotes}</p>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="bg-gradient-to-r from-brand-teal/5 to-brand-lavender/5 rounded-2xl p-5 border border-brand-teal/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <span className="font-black text-[10px] uppercase tracking-widest text-brand-black block mb-1">Coming Soon: Video Render</span>
              <p className="text-xs text-stone-400">Veo avatar generation will bring your spokesperson to life with lip-synced video</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
