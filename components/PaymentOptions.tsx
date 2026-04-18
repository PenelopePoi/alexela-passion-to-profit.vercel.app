import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Phone, Mail, CreditCard, ArrowRight, Shield, Clock, Copy, CheckCircle2, ExternalLink, X, Loader2 } from 'lucide-react';
import { createCheckoutSession, redirectToCheckout } from '../services/stripeService';
import { PackageTier } from '../types/financial';

// Package data matching Pricing.tsx exactly
const PACKAGE_MAP: Record<string, { name: string; price: string; tier: string }[]> = {
  budget: [
    { name: 'CardCut Calibrated', price: '$75', tier: 'The Seedling' },
    { name: 'Promotion Pal', price: '$125', tier: 'The Seedling' },
    { name: 'Sticker System', price: '$175', tier: 'The Seedling' },
  ],
  premium: [
    { name: 'Selling Sales Set', price: '$350', tier: 'The Growth' },
    { name: 'Registered Rebellion', price: '$500', tier: 'The Growth' },
    { name: 'Premiere Passion Pal', price: '$650', tier: 'The Growth' },
  ],
  elite: [
    { name: 'The Sovereignty Set', price: '$850', tier: 'The Sovereign' },
    { name: 'Site Sales Solution', price: '$1,200', tier: 'The Sovereign' },
    { name: 'Entrepreneurship Enterprise', price: '$1,500', tier: 'The Sovereign' },
    { name: 'Ultimate Premium Suite', price: '$2,000', tier: 'The Sovereign' },
  ],
};

interface PaymentOptionsProps {
  selectedTier: 'budget' | 'premium' | 'elite';
  customerName?: string;
  customerEmail?: string;
  onContinue: () => void;
  onDismiss: () => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  selectedTier,
  customerName,
  customerEmail,
  onContinue,
  onDismiss,
}) => {
  const [selectedPkg, setSelectedPkg] = useState<number>(0);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const handleStripeCheckout = async () => {
    if (!customerEmail) {
      setStripeError('Email is required for card payments.');
      return;
    }
    setStripeLoading(true);
    setStripeError(null);
    try {
      const tierMap: Record<string, PackageTier> = { budget: PackageTier.BUDGET, premium: PackageTier.PREMIUM, elite: PackageTier.ELITE };
      const session = await createCheckoutSession(tierMap[selectedTier], customerEmail);
      if (session.url) {
        window.location.href = session.url;
      } else {
        await redirectToCheckout(session.sessionId);
      }
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setStripeLoading(false);
    }
  };
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const packages = PACKAGE_MAP[selectedTier] || PACKAGE_MAP.budget;
  const currentPkg = packages[selectedPkg];
  const tierLabel = currentPkg.tier;

  const tierColors = {
    budget: {
      badge: 'bg-brand-teal/10 text-brand-teal border-brand-teal/30',
      selectedBtn: 'bg-brand-teal/10 border-brand-teal/30 text-brand-teal shadow-lg shadow-brand-teal/20',
      selectedPrice: 'text-brand-teal',
      priceBox: 'bg-brand-teal/10 border-brand-teal/30',
      priceText: 'text-brand-teal',
      checkboxActive: 'bg-brand-teal border-brand-teal',
      continueActive: 'bg-brand-teal text-white hover:bg-white hover:text-brand-black',
    },
    premium: {
      badge: 'bg-brand-lavender/10 text-brand-lavender border-brand-lavender/30',
      selectedBtn: 'bg-brand-lavender/10 border-brand-lavender/30 text-brand-lavender shadow-lg shadow-brand-lavender/20',
      selectedPrice: 'text-brand-lavender',
      priceBox: 'bg-brand-lavender/10 border-brand-lavender/30',
      priceText: 'text-brand-lavender',
      checkboxActive: 'bg-brand-lavender border-brand-lavender',
      continueActive: 'bg-brand-lavender text-white hover:bg-white hover:text-brand-black',
    },
    elite: {
      badge: 'bg-brand-lavender/10 text-brand-lavender border-brand-lavender/30',
      selectedBtn: 'bg-brand-lavender/10 border-brand-lavender/30 text-brand-lavender shadow-lg shadow-brand-lavender/20',
      selectedPrice: 'text-brand-lavender',
      priceBox: 'bg-brand-lavender/10 border-brand-lavender/30',
      priceText: 'text-brand-lavender',
      checkboxActive: 'bg-brand-lavender border-brand-lavender',
      continueActive: 'bg-brand-lavender text-white hover:bg-white hover:text-brand-black',
    },
  };
  const colors = tierColors[selectedTier];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0a0f1a] to-[#111827] rounded-[2rem] border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-8 pb-4">
          <button
            onClick={onDismiss}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${colors.badge} mb-4`}>
              {tierLabel} Package
            </span>
            <h2 className="text-3xl font-serif font-black text-white mb-2">
              Secure Your Brand Package
            </h2>
            {customerName && (
              <p className="text-white/50 text-sm">
                Welcome, <span className="text-white/80 font-semibold">{customerName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Package Selector */}
        <div className="px-8 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {packages.map((pkg, i) => (
              <button
                key={i}
                onClick={() => setSelectedPkg(i)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  selectedPkg === i
                    ? colors.selectedBtn
                    : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {pkg.name}
                <span className={`ml-2 font-black ${selectedPkg === i ? colors.selectedPrice : 'text-white/40'}`}>
                  {pkg.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Package Price Display */}
        <div className="px-8 py-6">
          <div className={`text-center p-6 rounded-2xl border ${colors.priceBox}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Your Selection</p>
            <h3 className="text-xl font-black text-white mb-1">{currentPkg.name}</h3>
            <p className={`text-5xl font-black ${colors.priceText} tracking-tight`}>{currentPkg.price}</p>
            <p className="text-[11px] text-white/40 mt-1 font-semibold">one-time payment</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="px-8 pb-6 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-center mb-4">
            Choose How to Pay
          </p>

          {/* Zelle */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#6d1ed4]/15 flex items-center justify-center shrink-0">
                <span className="text-[#6d1ed4] font-black text-sm">Z</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Zelle</p>
                <p className="text-white/60 text-xs">Instant bank transfer</p>
              </div>
              <button
                onClick={() => handleCopy('(321) 375-9685', 'zelle')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-semibold transition-colors"
              >
                {copiedField === 'zelle' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                (321) 375-9685
              </button>
            </div>
          </div>

          {/* Cash App */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00D632]/15 flex items-center justify-center shrink-0">
                <span className="text-[#00D632] font-black text-sm">$</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Cash App</p>
                <p className="text-white/60 text-xs">Send to cashtag</p>
              </div>
              <button
                onClick={() => handleCopy('$XelaStudio', 'cashapp')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-semibold transition-colors"
              >
                {copiedField === 'cashapp' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                $XelaStudio
              </button>
            </div>
          </div>

          {/* Venmo */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#008CFF]/15 flex items-center justify-center shrink-0">
                <span className="text-[#008CFF] font-black text-sm">V</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Venmo</p>
                <p className="text-white/60 text-xs">Pay with Venmo</p>
              </div>
              <button
                onClick={() => handleCopy('@XelaStudio', 'venmo')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-semibold transition-colors"
              >
                {copiedField === 'venmo' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                @XelaStudio
              </button>
            </div>
          </div>

          {/* Pay by Phone */}
          <a
            href="tel:+13213759685"
            className="block p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-brand-teal/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-teal/15 flex items-center justify-center shrink-0">
                <Phone size={20} className="text-brand-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Pay by Phone</p>
                <p className="text-white/60 text-xs">Call to pay with card over the phone</p>
              </div>
              <div className="flex items-center gap-1 text-brand-teal text-xs font-bold group-hover:gap-2 transition-all">
                Call Now <ArrowRight size={14} />
              </div>
            </div>
          </a>

          {/* Stripe Invoice Notice */}
          <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/15">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-teal/15 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard size={20} className="text-brand-teal" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm mb-1">Stripe Invoice</p>
                <p className="text-white/60 text-xs leading-relaxed">
                  Prefer to pay online? We will send a secure Stripe invoice to{' '}
                  {customerEmail ? (
                    <span className="text-white/80 font-semibold">{customerEmail}</span>
                  ) : (
                    'your email'
                  )}{' '}
                  within 1 hour. Pay with any credit or debit card.
                </p>
              </div>
              <div className="flex items-center gap-1 text-brand-teal/60 text-[10px] font-bold shrink-0">
                <Mail size={12} /> Auto-sent
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation + Continue */}
        <div className="px-8 pb-8 pt-2 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => setPaymentConfirmed(!paymentConfirmed)}
              className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                paymentConfirmed
                  ? colors.checkboxActive
                  : 'border-white/20 group-hover:border-white/40'
              }`}
            >
              {paymentConfirmed && <Check size={12} className="text-white" />}
            </div>
            <span className="text-white/60 text-xs leading-relaxed">
              I have sent payment or will pay via the Stripe invoice sent to my email. I understand work begins after payment is confirmed.
            </span>
          </label>

          {stripeError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-xs">
              {stripeError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleStripeCheckout}
              disabled={stripeLoading}
              className="flex-1 py-4 rounded-xl font-bold uppercase tracking-[0.12em] text-[11px] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-brand-teal text-brand-black hover:bg-white"
            >
              {stripeLoading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : <><CreditCard size={14} /> Pay with Card</>}
            </button>
            <button
              onClick={onContinue}
              className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-[0.12em] text-[11px] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                paymentConfirmed
                  ? colors.continueActive
                  : 'bg-white/10 text-white/40 cursor-default'
              }`}
              disabled={!paymentConfirmed}
            >
              I Already Paid <ArrowRight size={14} />
            </button>
          </div>

          {/* Skip for now - still allows continuing to see dashboard */}
          <button
            onClick={onContinue}
            className="w-full text-center text-white/30 hover:text-white/50 text-[10px] font-semibold uppercase tracking-widest transition-colors py-2"
          >
            Skip for now — view my brand preview first
          </button>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-semibold">
              <Shield size={12} /> Secure Payment
            </div>
            <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-semibold">
              <Clock size={12} /> Same-Day Delivery
            </div>
            <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-semibold">
              <CheckCircle2 size={12} /> 100% Satisfaction
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
