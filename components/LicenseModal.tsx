import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, Crown, Zap, Infinity as InfinityIcon } from 'lucide-react';
import { LICENSE_TIERS, LicenseTier, activateLicense, generateLicenseKey } from '../services/studioLicense';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (tier: LicenseTier) => void;
}

const TIER_ICONS: Record<LicenseTier, React.ReactNode> = {
  starter: <Zap className="w-8 h-8" />,
  pro: <Crown className="w-8 h-8" />,
  lifetime: <InfinityIcon className="w-8 h-8" />,
};

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [selectedTier, setSelectedTier] = useState<LicenseTier>('pro');
  const [processing, setProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async (tier: LicenseTier) => {
    setProcessing(true);
    setPurchaseError(null);
    try {
      const key = generateLicenseKey(tier);
      activateLicense(tier, key);
      onPurchase?.(tier);
      setTimeout(() => {
        setProcessing(false);
        onClose();
      }, 800);
    } catch (err) {
      setProcessing(false);
      setPurchaseError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again or call (321) 375-9685 for help.'
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-brand-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-brand-black border border-white/10 rounded-[2rem] max-w-5xl w-full p-6 md:p-10 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-10">
              <div className="inline-block px-4 py-2 bg-brand-lavender/10 border border-brand-lavender/30 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-lavender mb-4">
                <Sparkles size={12} className="inline mr-1" /> Unlock Studio Cloning
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-3">
                Get Your Own XELA Studio
              </h2>
              <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
                Clone the XELA template, customize it for your own brand, and start delivering to clients within hours. Choose the license that fits your business.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {Object.values(LICENSE_TIERS).map((tier) => (
                <motion.div
                  key={tier.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative cursor-pointer rounded-[2rem] p-6 md:p-8 border-2 transition-all ${
                    selectedTier === tier.id
                      ? tier.id === 'pro'
                        ? 'border-brand-lavender bg-brand-lavender/5 shadow-xl shadow-brand-lavender/10'
                        : 'border-brand-teal bg-brand-teal/5 shadow-xl shadow-brand-teal/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-lavender text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className={`mb-4 ${tier.id === 'pro' ? 'text-brand-lavender' : 'text-brand-teal'}`}>
                    {TIER_ICONS[tier.id]}
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-white">${tier.price}</span>
                    <span className="text-white/40 text-sm">{tier.duration === -1 ? 'forever' : `/ ${tier.duration} days`}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <Check size={14} className={tier.id === 'pro' ? 'text-brand-lavender shrink-0 mt-0.5' : 'text-brand-teal shrink-0 mt-0.5'} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePurchase(tier.id); }}
                    disabled={processing}
                    className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                      tier.id === 'pro'
                        ? 'bg-brand-lavender text-white hover:scale-105'
                        : 'bg-brand-teal text-brand-black hover:scale-105'
                    } disabled:opacity-50`}
                  >
                    {processing ? 'Processing...' : `Get ${tier.name}`}
                  </button>
                </motion.div>
              ))}
            </div>

            {purchaseError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 text-center">
                <p className="text-red-400 text-sm font-bold">{purchaseError}</p>
              </div>
            )}

            <p className="text-center text-white/40 text-xs">
              All plans include commercial use rights. Questions? Call (321) 375-9685
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LicenseModal;
