import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Download, Package, FileText, Loader2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generateWhiteLabelKit, WhiteLabelKit } from '../services/geminiService';

interface WhiteLabelExporterProps {
  input: BrandInput;
  strategy: BrandStrategy;
  packageName: string;
  onClose: () => void;
}

export const WhiteLabelExporter: React.FC<WhiteLabelExporterProps> = ({
  input,
  strategy,
  packageName,
  onClose,
}) => {
  const [clientName, setClientName] = useState('');
  const [kit, setKit] = useState<WhiteLabelKit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!clientName.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateWhiteLabelKit(input, strategy, clientName);
      setKit(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!kit) return;
    const exportData = {
      generatedFor: clientName,
      generatedBy: input.companyName,
      package: packageName,
      ...kit,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName.toLowerCase().replace(/\s+/g, '-')}-brand-kit.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: { key: string; title: string; content: string | string[] }[] = kit
    ? [
        { key: 'brandGuidelines', title: 'Brand Guidelines', content: kit.brandGuidelines },
        { key: 'colorSpec', title: 'Color Specification', content: kit.colorSpec },
        { key: 'typographySpec', title: 'Typography Specification', content: kit.typographySpec },
        { key: 'voiceGuidelines', title: 'Voice Guidelines', content: kit.voiceGuidelines },
        { key: 'socialTemplates', title: 'Social Template Ideas', content: kit.socialTemplateDescriptions },
        { key: 'clientIntroLetter', title: 'Client Intro Letter', content: kit.clientIntroLetter },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-[2.5rem] p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-brand-lavender" />
            <h2 className="text-2xl font-black tracking-tight">White-Label Export</h2>
          </div>
          <p className="text-stone-400 text-sm">{packageName}</p>
        </div>

        {/* Client name input */}
        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">
            Client Business Name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter your client's business name"
            className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-lg"
          />
        </div>

        {/* Pre-generation / Loading / Post-generation */}
        {!kit && !isGenerating && (
          <div className="space-y-3">
            <button
              onClick={handleGenerate}
              disabled={!clientName.trim()}
              className="w-full bg-brand-black text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate Kit
            </button>
            <p className="text-center text-xs text-stone-400">
              AI will generate a white-labeled brand kit with no Xela branding
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-center gap-2 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-brand-lavender animate-spin" />
            <p className="text-stone-500 text-sm font-medium">Engineering your white-label kit...</p>
          </div>
        )}

        {kit && !isGenerating && (
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.key}
                className="bg-stone-50 rounded-2xl p-6 border border-stone-100"
              >
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">
                    {section.title}
                  </span>
                  <motion.span
                    animate={{ rotate: expandedSections[section.key] ? 180 : 0 }}
                    className="text-stone-400 text-xs"
                  >
                    ▼
                  </motion.span>
                </button>

                {expandedSections[section.key] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 text-sm text-stone-600 leading-relaxed"
                  >
                    {Array.isArray(section.content) ? (
                      <ul className="space-y-2">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Sparkles className="w-3 h-3 text-brand-teal mt-1 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-wrap">{section.content}</p>
                    )}
                  </motion.div>
                )}
              </div>
            ))}

            <button
              onClick={handleDownload}
              className="w-full bg-brand-teal text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Brand Kit
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
