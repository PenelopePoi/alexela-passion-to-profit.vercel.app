import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Image as ImageIcon,
  Video,
  Music,
  Layout,
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Check,
} from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generateAssetBundleManifest } from '../services/geminiService';

interface BundleManifest {
  imagePrompts: Array<{ description: string; style: string; usage: string }>;
  videoPrompts: Array<{ description: string; duration: string; usage: string }>;
  audioPrompts: Array<{ description: string; type: string; usage: string }>;
  socialTemplates: Array<{ platform: string; description: string; dimensions: string }>;
}

interface BundleAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'template';
  description: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  usage: string;
}

interface BrandAssetBundleProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const categoryConfig = [
  {
    key: 'imagePrompts' as const,
    type: 'image' as const,
    label: 'Images',
    icon: ImageIcon,
    accent: 'blue',
    bgCircle: 'bg-blue-100',
    textAccent: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'videoPrompts' as const,
    type: 'video' as const,
    label: 'Videos',
    icon: Video,
    accent: 'purple',
    bgCircle: 'bg-purple-100',
    textAccent: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700',
  },
  {
    key: 'audioPrompts' as const,
    type: 'audio' as const,
    label: 'Audio',
    icon: Music,
    accent: 'green',
    bgCircle: 'bg-green-100',
    textAccent: 'text-green-600',
    badgeBg: 'bg-green-50 text-green-700',
  },
  {
    key: 'socialTemplates' as const,
    type: 'template' as const,
    label: 'Templates',
    icon: Layout,
    accent: 'orange',
    bgCircle: 'bg-orange-100',
    textAccent: 'text-orange-600',
    badgeBg: 'bg-orange-50 text-orange-700',
  },
];

function manifestToAssets(manifest: BundleManifest): BundleAsset[] {
  const assets: BundleAsset[] = [];

  manifest.imagePrompts.forEach((p, i) =>
    assets.push({
      id: `img-${i}`,
      type: 'image',
      description: p.description,
      status: 'pending',
      usage: p.usage,
    })
  );
  manifest.videoPrompts.forEach((p, i) =>
    assets.push({
      id: `vid-${i}`,
      type: 'video',
      description: p.description,
      status: 'pending',
      usage: p.usage,
    })
  );
  manifest.audioPrompts.forEach((p, i) =>
    assets.push({
      id: `aud-${i}`,
      type: 'audio',
      description: p.description,
      status: 'pending',
      usage: p.usage,
    })
  );
  manifest.socialTemplates.forEach((p, i) =>
    assets.push({
      id: `tpl-${i}`,
      type: 'template',
      description: p.description,
      status: 'pending',
      usage: p.platform ? `${p.platform} — ${p.dimensions}` : p.dimensions,
    })
  );

  return assets;
}

function StatusDot({ status }: { status: BundleAsset['status'] }) {
  if (status === 'generating')
    return <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />;
  if (status === 'done')
    return (
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 shrink-0">
        <Check className="w-3 h-3 text-white" />
      </span>
    );
  if (status === 'error')
    return <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />;
  return <span className="w-3 h-3 rounded-full bg-stone-300 shrink-0" />;
}

export const BrandAssetBundle: React.FC<BrandAssetBundleProps> = ({ input, strategy }) => {
  const [manifest, setManifest] = useState<BundleManifest | null>(null);
  const [assets, setAssets] = useState<BundleAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleGenerateManifest = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateAssetBundleManifest(input, strategy);
      setManifest(result);
      const newAssets = manifestToAssets(result);
      setAssets(newAssets);
      setGeneratedCount(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate asset bundle manifest.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingle = (id: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'generating' as const } : a))
    );
    setTimeout(() => {
      setAssets((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'done' as const } : a))
      );
      setGeneratedCount((c) => c + 1);
    }, 1200);
  };

  const handleGenerateAll = () => {
    const pending = assets.filter((a) => a.status === 'pending');
    setAssets((prev) => prev.map((a) => (a.status === 'pending' ? { ...a, status: 'generating' } : a)));
    setTimeout(() => {
      setAssets((prev) => prev.map((a) => (a.status === 'generating' ? { ...a, status: 'done' } : a)));
      setGeneratedCount((c) => c + pending.length);
    }, 2000);
  };

  const handleDownloadManifest = () => {
    if (!manifest) return;
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.companyName.replace(/\s+/g, '-').toLowerCase()}-asset-bundle.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const assetsByType = (type: BundleAsset['type']) => assets.filter((a) => a.type === type);
  const allDone = assets.length > 0 && assets.every((a) => a.status === 'done');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">Asset Packs</h2>
            <p className="text-sm text-stone-500">
              Brand-matched stock library — no subscription needed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {manifest && !allDone && (
            <button
              onClick={handleGenerateAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-700 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate All
            </button>
          )}
          <button
            onClick={handleGenerateManifest}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : manifest ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Bundle
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Category Grid */}
      {manifest && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {categoryConfig.map((cat, idx) => {
            const Icon = cat.icon;
            const items = assetsByType(cat.type);
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="bg-white rounded-[2rem] p-6 border border-stone-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${cat.bgCircle}`}>
                    <Icon className={`w-5 h-5 ${cat.textAccent}`} />
                  </div>
                  <h3 className="text-base font-bold text-stone-800">{cat.label}</h3>
                  <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${cat.badgeBg}`}>
                    {items.length}
                  </span>
                </div>

                <ul className="space-y-3">
                  {items.map((asset) => (
                    <li
                      key={asset.id}
                      className="flex items-start gap-3 group"
                    >
                      <div className="mt-1">
                        <StatusDot status={asset.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-700 leading-snug line-clamp-2">
                          {asset.description}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{asset.usage}</p>
                      </div>
                      {asset.status === 'pending' && (
                        <button
                          onClick={() => handleGenerateSingle(asset.id)}
                          className="opacity-0 group-hover:opacity-100 text-xs font-medium text-violet-600 hover:text-violet-800 transition-all shrink-0 mt-0.5"
                        >
                          Generate
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Download Section */}
      {manifest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-50 rounded-2xl p-5 border border-stone-100"
        >
          <div>
            <p className="text-sm font-semibold text-stone-700">
              {generatedCount}/{assets.length} assets processed
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Full asset generation coming soon — manifest includes all prompts for manual generation
            </p>
          </div>
          <button
            onClick={handleDownloadManifest}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Bundle Manifest
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
