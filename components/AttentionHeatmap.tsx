
import React, { useState, useRef } from 'react';
import { BrandInput, BrandStrategy } from '../types';
import { Loader2, Eye, Upload, BarChart3, AlertTriangle, CheckCircle, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMedia } from '../services/geminiService';

interface AttentionHeatmapProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

interface HeatmapZone {
  area: string;
  attention: 'high' | 'medium' | 'low';
  seconds: number;
  note: string;
}

interface AnalysisResult {
  overallScore: number;
  firstImpression: string;
  hierarchy: string[];
  zones: HeatmapZone[];
  blindSpots: string[];
  improvements: string[];
  readability: number;
  brandRecognition: number;
  callToActionStrength: number;
}

export const AttentionHeatmap: React.FC<AttentionHeatmapProps> = ({ input, strategy }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!uploadedImage) return;
    setIsAnalyzing(true);
    try {
      const prompt = `You are an expert visual attention analyst and UX researcher. Analyze this brand asset image for "${input.companyName}" (${input.industry}, ${input.vibe} vibe).

Simulate an eye-tracking study. Predict where viewers look first, second, third, and what they miss entirely.

Return ONLY valid JSON:
{
  "overallScore": <0-100 attention effectiveness score>,
  "firstImpression": "<what the eye sees in the first 0.5 seconds>",
  "hierarchy": ["<first thing noticed>", "<second>", "<third>", "<fourth>"],
  "zones": [
    {"area": "<zone name>", "attention": "high|medium|low", "seconds": <avg fixation time>, "note": "<why>"}
  ],
  "blindSpots": ["<element viewers will likely miss>"],
  "improvements": ["<specific actionable fix>"],
  "readability": <0-100>,
  "brandRecognition": <0-100 how fast viewers identify the brand>,
  "callToActionStrength": <0-100>
}`;

      const raw = await analyzeMedia(prompt, uploadedImage, 'image/png');
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setAnalysis(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAttentionColor = (level: string) => {
    if (level === 'high') return 'bg-red-500/20 text-red-600 border-red-300';
    if (level === 'medium') return 'bg-amber-500/20 text-amber-600 border-amber-300';
    return 'bg-blue-500/20 text-blue-600 border-blue-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-brand-teal';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-brand-black">Attention Heatmap</h2>
          <p className="text-stone-500 mt-1">AI eye-tracking simulation — see what viewers notice first, last, and never.</p>
        </div>
        <div className="px-4 py-2 bg-brand-lavender/10 text-brand-lavender rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Eye size={12} /> Visual Intelligence
        </div>
      </div>

      {/* Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-stone-300 hover:border-brand-lavender rounded-[2rem] p-12 text-center cursor-pointer transition-all hover:bg-brand-lavender/5 group"
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        {uploadedImage ? (
          <img src={uploadedImage} alt="Uploaded" className="max-h-64 mx-auto rounded-2xl" />
        ) : (
          <div className="space-y-4">
            <Upload size={40} className="mx-auto text-stone-300 group-hover:text-brand-lavender transition-colors" />
            <p className="font-black text-[10px] uppercase tracking-widest text-stone-400">Upload a brand asset to analyze</p>
            <p className="text-stone-300 text-sm">Logos, flyers, business cards, social posts, landing pages</p>
          </div>
        )}
      </div>

      {uploadedImage && !analysis && (
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="w-full py-6 bg-brand-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-lavender transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <><Loader2 size={20} className="animate-spin" /> Running Eye-Tracking Simulation...</>
          ) : (
            <><Eye size={20} /> Analyze Visual Attention</>
          )}
        </button>
      )}

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Overall Score', value: analysis.overallScore, icon: Target },
                { label: 'Readability', value: analysis.readability, icon: Eye },
                { label: 'Brand Recognition', value: analysis.brandRecognition, icon: Sparkles },
                { label: 'CTA Strength', value: analysis.callToActionStrength, icon: BarChart3 },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center space-y-2">
                  <card.icon size={20} className="mx-auto text-stone-300" />
                  <div className={`text-4xl font-black ${getScoreColor(card.value)}`}>{card.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">{card.label}</div>
                </div>
              ))}
            </div>

            {/* First Impression */}
            <div className="bg-brand-black rounded-[2rem] p-8 text-white">
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-teal mb-3">First 0.5 Seconds</div>
              <p className="text-xl font-serif italic">{analysis.firstImpression}</p>
            </div>

            {/* Visual Hierarchy */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Viewing Order</h3>
              <div className="flex flex-wrap gap-3 items-center">
                {analysis.hierarchy.map((item, i) => (
                  <React.Fragment key={i}>
                    <div className="px-5 py-3 bg-white rounded-xl border border-stone-200 shadow-sm">
                      <span className="text-brand-teal font-black mr-2">{i + 1}.</span>
                      <span className="font-bold text-brand-black">{item}</span>
                    </div>
                    {i < analysis.hierarchy.length - 1 && <Target size={14} className="text-stone-300" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Attention Zones */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Attention Zones</h3>
              <div className="space-y-3">
                {analysis.zones.map((zone, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${getAttentionColor(zone.attention)}`}>
                    <div className={`w-3 h-3 rounded-full ${zone.attention === 'high' ? 'bg-red-500' : zone.attention === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <span className="font-black text-sm">{zone.area}</span>
                      <span className="text-xs ml-2 opacity-70">~{zone.seconds}s fixation</span>
                    </div>
                    <span className="text-xs max-w-xs">{zone.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blind Spots */}
            {analysis.blindSpots.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                  <AlertTriangle size={12} /> Blind Spots — Viewers Will Miss These
                </h3>
                <div className="space-y-2">
                  {analysis.blindSpots.map((spot, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                      <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-red-700">{spot}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-teal flex items-center gap-2">
                <CheckCircle size={12} /> Recommended Fixes
              </h3>
              <div className="space-y-2">
                {analysis.improvements.map((fix, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-brand-teal/5 rounded-xl border border-brand-teal/20">
                    <CheckCircle size={16} className="text-brand-teal mt-0.5 shrink-0" />
                    <span className="text-sm text-brand-black">{fix}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Re-analyze */}
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
              Re-Analyze
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
