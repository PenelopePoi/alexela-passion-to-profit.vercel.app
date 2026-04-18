import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Anchor,
  Copy,
  Download,
  Check,
  Loader2,
  AlertCircle,
  Code,
  Palette,
  Mail,
  FileText,
  Globe,
  ShoppingBag,
  Instagram,
  Sparkles,
} from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { translateBrandFormat } from '../services/geminiService';

interface BrandFormatBridgeProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const FORMATS = [
  { id: 'css-variables', label: 'CSS Variables', icon: Code, description: 'Colors + fonts as :root custom properties', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'canva-palette', label: 'Canva Palette', icon: Palette, description: 'Import-ready color palette for Canva', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'email-signature', label: 'Email Signature', icon: Mail, description: 'HTML email signature with brand colors', color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'brand-one-pager', label: 'Brand One-Pager', icon: FileText, description: 'Single-page brand summary', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'google-bio', label: 'Google Business Bio', icon: Globe, description: '750-char Google Business Profile description', color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'social-captions', label: 'Social Captions', icon: Instagram, description: 'Platform-ready captions in brand voice', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'invoice-items', label: 'Invoice Line Items', icon: ShoppingBag, description: 'Package pricing as invoice-ready rows', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { id: 'tailwind-config', label: 'Tailwind Config', icon: Code, description: 'Brand colors as Tailwind theme', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

export const BrandFormatBridge: React.FC<BrandFormatBridgeProps> = ({ input, strategy }) => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { content: string; filename: string }>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (formatId: string) => {
    setGenerating(formatId);
    setError(null);
    try {
      const result = await translateBrandFormat(input, strategy, formatId);
      setResults(prev => ({ ...prev, [formatId]: result }));
    } catch (err: any) {
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = async (formatId: string) => {
    const result = results[formatId];
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(formatId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (formatId: string) => {
    const result = results[formatId];
    if (!result) return;
    const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-stone-900 rounded-2xl">
          <Anchor className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-stone-900">Format Bridge</h2>
          <p className="text-stone-500 text-sm">Translate your brand into any format</p>
        </div>
        <Sparkles className="w-5 h-5 text-amber-400 ml-auto" />
      </div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Format grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {FORMATS.map((format) => {
          const Icon = format.icon;
          const result = results[format.id];
          const isGenerating = generating === format.id;
          const isCopied = copied === format.id;

          return (
            <motion.div
              key={format.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[2rem] p-6 border border-stone-100 hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${format.bg}`}>
                  <Icon className={`w-5 h-5 ${format.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-stone-900 text-sm leading-tight">{format.label}</h3>
                  <p className="text-stone-400 text-xs mt-1 leading-relaxed">{format.description}</p>
                </div>
              </div>

              {/* Result preview */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-3 overflow-hidden"
                >
                  <pre className="bg-stone-50 rounded-xl p-4 font-mono text-xs text-stone-700 overflow-hidden max-h-32 whitespace-pre-wrap break-all">
                    {result.content.length > 300 ? result.content.slice(0, 300) + '...' : result.content}
                  </pre>
                </motion.div>
              )}

              <div className="mt-auto">
                {!result ? (
                  <button
                    onClick={() => handleTranslate(format.id)}
                    disabled={isGenerating}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isGenerating
                        ? 'bg-stone-100 text-stone-400 cursor-wait'
                        : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      'Translate'
                    )}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(format.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all active:scale-[0.98]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(format.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-all active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
