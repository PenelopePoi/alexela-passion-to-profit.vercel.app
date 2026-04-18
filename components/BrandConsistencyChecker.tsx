
import React, { useState, useRef } from 'react';
import { BrandInput, BrandStrategy } from '../types';
import { analyzeMedia } from '../services/geminiService';
import { Upload, ShieldCheck, Loader2, AlertTriangle, CheckCircle, XCircle, Palette, Type as TypeIcon, Eye, Target, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BrandConsistencyCheckerProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

interface Violation {
  element: string;
  severity: 'critical' | 'warning' | 'info';
  issue: string;
  fix: string;
}

interface AssetAudit {
  assetName: string;
  imageData: string;
  overallScore: number;
  colorAccuracy: number;
  fontCompliance: number;
  layoutScore: number;
  violations: Violation[];
  strengths: string[];
}

export const BrandConsistencyChecker: React.FC<BrandConsistencyCheckerProps> = ({ input, strategy }) => {
  const [assets, setAssets] = useState<{ name: string; data: string }[]>([]);
  const [audits, setAudits] = useState<AssetAudit[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeAuditIndex, setActiveAuditIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        setAssets(prev => [...prev, { name: file.name, data: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeAsset = (index: number) => {
    setAssets(prev => prev.filter((_, i) => i !== index));
    setAudits(prev => prev.filter((_, i) => i !== index));
  };

  const runAudit = async () => {
    if (assets.length === 0) return;
    setIsAuditing(true);
    setAudits([]);

    const brandGuidelines = `
Brand: ${input.companyName}
Primary Color: ${strategy.colorPalette.primary}
Secondary Color: ${strategy.colorPalette.secondary}
Accent Color: ${strategy.colorPalette.accent}
Background Color: ${strategy.colorPalette.background}
Heading Font: ${strategy.typographyRecommendation.headingFont}
Body Font: ${strategy.typographyRecommendation.bodyFont}
Voice: ${strategy.brandVoice}
Vibe: ${input.vibe}`;

    const results: AssetAudit[] = [];

    for (const asset of assets) {
      try {
        const prompt = `You are a brand consistency auditor. Check this asset against these brand guidelines:

${brandGuidelines}

Analyze: color accuracy, font compliance, layout quality, brand voice consistency, and overall brand alignment.

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "colorAccuracy": <0-100>,
  "fontCompliance": <0-100>,
  "layoutScore": <0-100>,
  "violations": [
    {"element": "<what>", "severity": "critical|warning|info", "issue": "<what's wrong>", "fix": "<how to fix>"}
  ],
  "strengths": ["<what's done well>"]
}`;

        const raw = await analyzeMedia(prompt, asset.data, 'image/png');
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        results.push({
          assetName: asset.name,
          imageData: asset.data,
          ...parsed,
        });
      } catch (err) {
        results.push({
          assetName: asset.name,
          imageData: asset.data,
          overallScore: 0,
          colorAccuracy: 0,
          fontCompliance: 0,
          layoutScore: 0,
          violations: [{ element: 'Analysis', severity: 'critical', issue: 'Failed to analyze this asset', fix: 'Try re-uploading' }],
          strengths: [],
        });
      }
    }

    setAudits(results);
    setActiveAuditIndex(0);
    setIsAuditing(false);
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === 'critical') return 'bg-red-50 border-red-200 text-red-700';
    if (severity === 'warning') return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-blue-50 border-blue-200 text-blue-700';
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <XCircle size={16} className="text-red-500" />;
    if (severity === 'warning') return <AlertTriangle size={16} className="text-amber-500" />;
    return <Eye size={16} className="text-blue-500" />;
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { label: 'A+', color: 'text-brand-teal' };
    if (score >= 80) return { label: 'A', color: 'text-brand-teal' };
    if (score >= 70) return { label: 'B', color: 'text-amber-500' };
    if (score >= 60) return { label: 'C', color: 'text-amber-600' };
    return { label: 'F', color: 'text-red-500' };
  };

  const activeAudit = audits[activeAuditIndex];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-brand-black">Brand Consistency Checker</h2>
          <p className="text-stone-500 mt-1">Upload assets — AI scores them against your brand guidelines.</p>
        </div>
        <div className="px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={12} /> Quality Control
        </div>
      </div>

      {/* Brand Guidelines Reference */}
      <div className="bg-stone-50 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Colors</div>
          <div className="flex gap-2">
            {[strategy.colorPalette.primary, strategy.colorPalette.secondary, strategy.colorPalette.accent].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-lg border border-stone-200 shadow-sm" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Heading Font</div>
          <div className="font-bold text-brand-black">{strategy.typographyRecommendation.headingFont}</div>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Body Font</div>
          <div className="font-bold text-brand-black">{strategy.typographyRecommendation.bodyFont}</div>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Vibe</div>
          <div className="font-bold text-brand-black">{input.vibe}</div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-6 py-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-teal transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Add Assets
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          <span className="text-stone-400 text-sm">{assets.length} asset{assets.length !== 1 ? 's' : ''} loaded</span>
        </div>

        {assets.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {assets.map((asset, i) => (
              <div key={i} className="relative group">
                <img src={asset.data} alt={asset.name} className="w-20 h-20 object-cover rounded-xl border border-stone-200" />
                <button
                  onClick={() => removeAsset(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
                <div className="text-[8px] text-stone-400 truncate w-20 mt-1">{asset.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run Audit */}
      {assets.length > 0 && (
        <button
          onClick={runAudit}
          disabled={isAuditing}
          className="w-full py-6 bg-brand-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-teal transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isAuditing ? (
            <><Loader2 size={20} className="animate-spin" /> Auditing {assets.length} Asset{assets.length !== 1 ? 's' : ''}...</>
          ) : (
            <><ShieldCheck size={20} /> Run Brand Audit</>
          )}
        </button>
      )}

      {/* Results */}
      {audits.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Asset Tabs */}
          {audits.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {audits.map((audit, i) => {
                const grade = getScoreGrade(audit.overallScore);
                return (
                  <button
                    key={i}
                    onClick={() => setActiveAuditIndex(i)}
                    className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      i === activeAuditIndex
                        ? 'border-brand-teal bg-brand-teal/5'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <img src={audit.imageData} alt="" className="w-8 h-8 object-cover rounded-lg" />
                    <div className="text-left">
                      <div className="text-[10px] font-black truncate max-w-[100px]">{audit.assetName}</div>
                      <div className={`text-sm font-black ${grade.color}`}>{grade.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Audit Detail */}
          {activeAudit && (
            <div className="space-y-8">
              {/* Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Overall', value: activeAudit.overallScore, icon: Target },
                  { label: 'Color Accuracy', value: activeAudit.colorAccuracy, icon: Palette },
                  { label: 'Font Compliance', value: activeAudit.fontCompliance, icon: TypeIcon },
                  { label: 'Layout', value: activeAudit.layoutScore, icon: Eye },
                ].map(card => {
                  const grade = getScoreGrade(card.value);
                  return (
                    <div key={card.label} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center space-y-2">
                      <card.icon size={20} className="mx-auto text-stone-300" />
                      <div className={`text-4xl font-black ${grade.color}`}>{card.value}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">{card.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Violations */}
              {activeAudit.violations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    Violations ({activeAudit.violations.filter(v => v.severity === 'critical').length} critical, {activeAudit.violations.filter(v => v.severity === 'warning').length} warnings)
                  </h3>
                  {activeAudit.violations.map((v, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${getSeverityStyle(v.severity)}`}>
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(v.severity)}
                        <div className="flex-1">
                          <div className="font-black text-sm">{v.element}</div>
                          <div className="text-sm mt-1">{v.issue}</div>
                          <div className="text-xs mt-2 opacity-70">Fix: {v.fix}</div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{v.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths */}
              {activeAudit.strengths.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-teal flex items-center gap-2">
                    <CheckCircle size={12} /> What's Done Well
                  </h3>
                  {activeAudit.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-brand-teal/5 rounded-xl border border-brand-teal/20">
                      <CheckCircle size={16} className="text-brand-teal mt-0.5 shrink-0" />
                      <span className="text-sm text-brand-black">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
