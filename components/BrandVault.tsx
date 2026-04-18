import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Download, Check, Loader2, AlertCircle, FileText, Palette, Type, Image as ImageIcon, Mail, Calendar, Package, Lock } from 'lucide-react';
import { BrandInput, BrandStrategy, LogoCandidate } from '../types';
import { generateBrandVaultManifest } from '../services/geminiService';

interface BrandVaultProps {
  input: BrandInput;
  strategy: BrandStrategy;
  logoCandidates: LogoCandidate[];
}

const VAULT_ITEMS = [
  { id: 'strategy', label: 'Brand Strategy', icon: FileText, description: 'Mission, vision, voice, values', included: true },
  { id: 'colors', label: 'Color Palette', icon: Palette, description: 'Hex, RGB, CSS variables', included: true },
  { id: 'typography', label: 'Typography', icon: Type, description: 'Font pairings + Google Fonts links', included: true },
  { id: 'logos', label: 'Logo Concepts', icon: ImageIcon, description: 'All generated logo images', included: true },
  { id: 'taglines', label: 'Taglines & Copy', icon: FileText, description: 'All taglines, flyer copy, ads', included: true },
  { id: 'emails', label: 'Email Templates', icon: Mail, description: '5 marketing email templates', included: false },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar, description: '30-day social media plan', included: false },
  { id: 'packages', label: 'Pricing Packages', icon: Package, description: '10 branding packages', included: false },
  { id: 'guidelines', label: 'Brand Guidelines', icon: FileText, description: 'Formal usage document', included: false },
];

const getAssetCount = (id: string, strategy: BrandStrategy, logoCandidates: LogoCandidate[]): number => {
  switch (id) {
    case 'strategy': return 1;
    case 'colors': return strategy.colorPalette ? 4 : 0;
    case 'typography': return strategy.typographyRecommendation ? 2 : 0;
    case 'logos': return logoCandidates.length;
    case 'taglines': return (strategy.taglines?.length || 0) + (strategy.flyerCopy ? 1 : 0) + (strategy.classifiedAdCopy ? 1 : 0);
    case 'emails': return strategy.emailTemplates?.length || 0;
    case 'calendar': return strategy.contentCalendar?.length || 0;
    case 'packages': return strategy.packages?.length || 0;
    case 'guidelines': return strategy.brandGuidelines ? 1 : 0;
    default: return 0;
  }
};

export const BrandVault: React.FC<BrandVaultProps> = ({ input, strategy, logoCandidates }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [manifest, setManifest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  const vaultItems = VAULT_ITEMS.map((item) => ({
    ...item,
    included: item.id === 'emails' ? !!strategy.emailTemplates
      : item.id === 'calendar' ? !!strategy.contentCalendar
      : item.id === 'packages' ? !!strategy.packages
      : item.id === 'guidelines' ? !!strategy.brandGuidelines
      : item.included,
  }));

  const includedCount = vaultItems.filter((i) => i.included).length;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const brandBook = await generateBrandVaultManifest(input, strategy);
      setManifest(brandBook);

      const vault = {
        exportedAt: new Date().toISOString(),
        generator: 'XELA Creative Branding Studio',
        version: '1.0',
        brandInput: input,
        brandStrategy: strategy,
        logoCandidates,
        brandBook,
        assetSummary: {
          totalCategories: includedCount,
          totalAssets: vaultItems.reduce((sum, item) => sum + (item.included ? getAssetCount(item.id, strategy, logoCandidates) : 0), 0),
        },
      };

      const blob = new Blob([JSON.stringify(vault, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${input.companyName.replace(/\s+/g, '-').toLowerCase()}-brand-vault.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate vault. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="bg-brand-black rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-brand-teal blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-brand-lavender blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-teal/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-brand-teal" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Brand Vault</h2>
              <p className="text-stone-400 text-sm mt-1">
                You own your brand. Not us. Not the platform. You.
              </p>
            </div>
          </div>

          <p className="text-stone-500 text-xs max-w-lg mt-2 mb-8">
            One-click offline export of everything — strategy, colors, typography, logos, copy, templates, calendars, and packages. Platform-independent brand ownership.
          </p>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-brand-teal text-white rounded-2xl px-10 py-5 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Vault...
              </>
            ) : exported ? (
              <>
                <Check className="w-4 h-4" />
                Vault Exported
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Full Vault
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Asset Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-10">
        {vaultItems.map((item, index) => {
          const Icon = item.icon;
          const count = getAssetCount(item.id, strategy, logoCandidates);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="bg-white rounded-[2rem] p-6 border border-stone-100 flex items-start gap-4 hover:shadow-lg transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.included ? 'bg-brand-teal/10' : 'bg-stone-100'
              }`}>
                <Icon className={`w-5 h-5 ${item.included ? 'text-brand-teal' : 'text-stone-400'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-stone-900 truncate">{item.label}</h3>
                  {item.included ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">{item.description}</p>
                {item.included && count > 0 && (
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-teal bg-brand-teal/10 px-2.5 py-1 rounded-full">
                    {count} asset{count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Manifest Preview */}
      {manifest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >
          <div className="bg-white rounded-[2rem] border border-stone-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-brand-teal" />
              <h3 className="font-black text-sm uppercase tracking-widest text-stone-900">Brand Book Preview</h3>
            </div>
            <div className="bg-stone-50 rounded-2xl p-6 max-h-96 overflow-y-auto">
              <pre className="text-xs text-stone-700 whitespace-pre-wrap font-mono leading-relaxed">
                {manifest}
              </pre>
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs text-stone-500">
              <Shield className="w-4 h-4" />
              <span>This document is included in your exported vault. Rebuild your entire brand from this alone.</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
