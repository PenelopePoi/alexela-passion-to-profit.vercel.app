import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Download, Code, Palette, Globe, ShoppingBag, Printer, Layout, Loader2, Check, AlertCircle, FileJson } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { compileBrandToFormat } from '../services/geminiService';

interface NativeExportEngineProps {
  input: BrandInput;
  strategy: BrandStrategy;
  onClose: () => void;
}

const EXPORT_FORMATS = [
  { id: 'json', label: 'JSON Bundle', icon: FileJson, description: 'Full brand data export', ext: '.json', tier: 'free', color: 'text-stone-600' },
  { id: 'css', label: 'CSS Variables', icon: Code, description: 'Custom properties for web', ext: '.css', tier: 'free', color: 'text-blue-500' },
  { id: 'canva', label: 'Canva Colors', icon: Palette, description: 'Import-ready palette file', ext: '.colors', tier: 'premium', color: 'text-purple-500' },
  { id: 'figma', label: 'Figma Tokens', icon: Layout, description: 'W3C design token JSON', ext: '.json', tier: 'premium', color: 'text-pink-500' },
  { id: 'shopify', label: 'Shopify Liquid', icon: ShoppingBag, description: 'Theme color snippet', ext: '.liquid', tier: 'elite', color: 'text-green-500' },
  { id: 'wordpress', label: 'WordPress CSS', icon: Globe, description: 'Theme stylesheet', ext: '.css', tier: 'elite', color: 'text-blue-600' },
  { id: 'cmyk', label: 'Print CMYK', icon: Printer, description: 'Print-ready color specs', ext: '.txt', tier: 'elite', color: 'text-orange-500' },
] as const;

const TIER_STYLES: Record<string, string> = {
  free: 'bg-stone-100 text-stone-600',
  premium: 'bg-purple-100 text-purple-700',
  elite: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700',
};

export const NativeExportEngine: React.FC<NativeExportEngineProps> = ({ input, strategy, onClose }) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (formatId: string) => {
    setExporting(formatId);
    setError(null);

    try {
      if (formatId === 'json') {
        const slug = input.companyName.toLowerCase().replace(/\s+/g, '-');
        const bundle = { brand: input, strategy };
        triggerDownload(JSON.stringify(bundle, null, 2), `${slug}-brand-bundle.json`, 'application/json');
      } else {
        const result = await compileBrandToFormat(strategy, input, formatId);
        triggerDownload(result.content, result.filename, result.mimeType);
      }

      setExported((prev) => new Set(prev).add(formatId));
    } catch (err: any) {
      setError(`Export failed for ${formatId}: ${err.message || 'Unknown error'}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-white rounded-[2.5rem] p-10 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-black tracking-tight text-stone-900">Export Engine</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-6 h-6 text-stone-400" />
          </button>
        </div>
        <p className="text-stone-500 mb-8">Compile your brand into platform-native formats</p>

        {/* Error banner */}
        {error && (
          <motion.div
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Format grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            const isExporting = exporting === format.id;
            const isExported = exported.has(format.id);

            return (
              <motion.div
                key={format.id}
                className="bg-stone-50 rounded-2xl p-5 border border-stone-100 hover:shadow-lg transition-all flex items-center gap-4"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm shrink-0`}>
                  <Icon className={`w-6 h-6 ${format.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-stone-900 text-sm">{format.label}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${TIER_STYLES[format.tier]}`}>
                      {format.tier}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{format.description}</p>
                  <span className="text-[10px] font-mono text-stone-400 mt-1 inline-block">{format.ext}</span>
                </div>

                {/* Action */}
                <button
                  onClick={() => handleExport(format.id)}
                  disabled={isExporting}
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isExported
                      ? 'bg-green-100 text-green-600'
                      : isExporting
                      ? 'bg-stone-200 text-stone-400 cursor-wait'
                      : 'bg-stone-900 text-white hover:bg-stone-700 active:scale-95'
                  }`}
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isExported ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            {exported.size > 0
              ? `${exported.size} format${exported.size > 1 ? 's' : ''} exported`
              : 'Select a format to export'}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
