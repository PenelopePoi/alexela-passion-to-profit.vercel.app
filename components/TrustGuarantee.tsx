
import React from 'react';
import { Shield, Lock, FolderOpen, Infinity, Star, Clock, UserCheck, BadgeCheck } from 'lucide-react';

const TRUST_POINTS = [
  { icon: Lock, title: 'Secure Payments', desc: 'SSL-encrypted checkout via Stripe' },
  { icon: FolderOpen, title: 'Own Everything', desc: 'Full commercial rights to every asset' },
  { icon: Infinity, title: 'Lifetime File Access', desc: 'Download your files anytime, forever' },
] as const;

const TRUST_SIGNALS = [
  { icon: BadgeCheck, label: '100% Money-Back Guarantee', color: 'text-green-500' },
  { icon: Clock, label: 'Same-Day Delivery', color: 'text-brand-teal' },
  { icon: UserCheck, label: 'Real Human Creative Director', color: 'text-brand-lavender' },
  { icon: Star, label: '5.0 Rating — Clients Love Us', color: 'text-yellow-500' },
] as const;

export const TrustGuarantee: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 bg-brand-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent" />
      {/* Trust Signals Strip */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_SIGNALS.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <Icon size={18} className={color} />
              <span className="text-[11px] font-black uppercase tracking-widest text-white/90">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-stone-200 shadow-sm p-10 md:p-14">
        {/* Badge + Heading */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-5">
            <Shield size={32} className="text-brand-teal" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-black mb-4">
            100% Satisfaction Guarantee
          </h2>
          <p className="text-stone-600 max-w-xl leading-relaxed">
            If you're not completely satisfied with your brand package, we'll revise it until you are
            — or give you a full refund. No questions asked.
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-stone-200 mx-auto mb-10" />

        {/* Trust Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-4">
                <Icon size={22} className="text-brand-black" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-brand-black mb-1">
                {title}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
