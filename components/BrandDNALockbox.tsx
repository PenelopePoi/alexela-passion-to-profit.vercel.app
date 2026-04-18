import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Lock, Download, Check, Loader2, AlertCircle, Shield, Clock, Hash } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generateBrandCertificate } from '../services/geminiService';

interface BrandDNALockboxProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

export const BrandDNALockbox: React.FC<BrandDNALockboxProps> = ({ input, strategy }) => {
  const [brandHash, setBrandHash] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const computeBrandHash = async () => {
    const brandData = JSON.stringify({
      companyName: input.companyName,
      industry: input.industry,
      mission: strategy.missionStatement,
      vision: strategy.visionStatement,
      voice: strategy.brandVoice,
      colors: strategy.colorPalette,
      typography: strategy.typographyRecommendation,
      taglines: strategy.taglines,
    });
    const encoder = new TextEncoder();
    const data = encoder.encode(brandData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleComputeHash = async () => {
    setIsHashing(true);
    setError(null);
    try {
      const hash = await computeBrandHash();
      setBrandHash(hash);
      setTimestamp(new Date().toISOString());
    } catch (err) {
      setError('Failed to compute brand hash. Please try again.');
    } finally {
      setIsHashing(false);
    }
  };

  useEffect(() => {
    handleComputeHash();
  }, []);

  const handleGenerateCertificate = async () => {
    if (!brandHash || !timestamp) return;
    setIsGenerating(true);
    setError(null);
    try {
      const cert = await generateBrandCertificate(input, strategy, brandHash, timestamp);
      setCertificate(cert);
    } catch (err) {
      setError('Failed to generate certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!certificate) return;
    const content = [
      `BRAND CERTIFICATE OF ORIGIN`,
      `===========================`,
      ``,
      `Company: ${input.companyName}`,
      `Owner: ${input.ownerName || input.companyName}`,
      `SHA-256 Hash: ${brandHash}`,
      `Timestamp: ${timestamp}`,
      ``,
      `---`,
      ``,
      certificate,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.companyName.replace(/\s+/g, '-').toLowerCase()}-brand-certificate.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Fingerprint className="absolute top-8 right-8 w-48 h-48 text-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-brand-teal" />
            <h2 className="text-3xl font-black tracking-widest uppercase">Brand DNA Lockbox</h2>
          </div>
          <p className="text-stone-400 text-lg">Cryptographic proof of your brand's origin</p>
        </div>

        {/* Brand Fingerprint */}
        {brandHash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-4 relative z-10"
          >
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <Hash className="w-4 h-4" />
              <span className="font-bold uppercase tracking-widest">SHA-256 Brand Fingerprint</span>
            </div>
            <div className="font-mono text-xs bg-stone-900/50 rounded-2xl p-4 break-all text-brand-teal">
              {brandHash}
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-stone-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{timestamp ? new Date(timestamp).toLocaleString() : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{input.ownerName || input.companyName}</span>
              </div>
            </div>
          </motion.div>
        )}

        {isHashing && (
          <div className="mt-8 flex items-center gap-3 text-stone-400 relative z-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Computing brand fingerprint...</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Certificate Section */}
      {brandHash && (
        <div className="space-y-4">
          {!certificate ? (
            <button
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
              className="w-full bg-brand-lavender hover:bg-brand-lavender/90 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Certificate...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Generate Certificate
                </>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-[2.5rem] p-10 border-2 border-brand-lavender/20 shadow-2xl">
                <div className="text-center mb-8">
                  <Shield className="w-10 h-10 text-brand-lavender mx-auto mb-3" />
                  <h3 className="text-2xl font-black tracking-widest uppercase text-brand-black">Brand Certificate of Origin</h3>
                  <div className="w-24 h-1 bg-brand-teal mx-auto mt-3 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div><span className="font-bold text-stone-500">Company:</span> {input.companyName}</div>
                  <div><span className="font-bold text-stone-500">Owner:</span> {input.ownerName || input.companyName}</div>
                  <div><span className="font-bold text-stone-500">Date:</span> {timestamp ? new Date(timestamp).toLocaleDateString() : '—'}</div>
                  <div><span className="font-bold text-stone-500">Industry:</span> {input.industry}</div>
                </div>
                <div className="font-mono text-[10px] bg-stone-50 rounded-xl p-3 break-all text-stone-500 mb-6">
                  {brandHash}
                </div>
                <div className="prose prose-stone max-w-none text-sm whitespace-pre-wrap leading-relaxed">
                  {certificate}
                </div>
              </div>
              <button
                onClick={handleDownloadCertificate}
                className="w-full bg-brand-black hover:bg-stone-800 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" />
                Download Certificate
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-stone-50 rounded-[2rem] p-8">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-brand-teal" />
            <h4 className="font-black text-sm tracking-widest uppercase text-brand-black">What This Proves</h4>
          </div>
          <p className="text-stone-600 text-sm leading-relaxed">
            The SHA-256 hash above is a unique fingerprint of your brand strategy. It mathematically proves that this exact combination of name, mission, colors, voice, and taglines existed at the recorded timestamp. Even a single character change would produce a completely different hash.
          </p>
        </div>
        <div className="bg-stone-50 rounded-[2rem] p-8">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-brand-lavender" />
            <h4 className="font-black text-sm tracking-widest uppercase text-brand-black">How to Verify</h4>
          </div>
          <p className="text-stone-600 text-sm leading-relaxed">
            To verify authenticity, re-hash the same brand data using SHA-256. If the resulting hash matches the one on your certificate, it confirms the brand identity is unchanged since the original creation date. This is the same principle behind blockchain and digital signatures.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
