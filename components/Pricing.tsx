
import React from 'react';
import { Check, Zap, Shield, Rocket, Star, Globe, ChevronRight, ShoppingCart, MessageCircle, FileText, Video } from 'lucide-react';

interface PricingProps {
  onSelectPackage: (tier: 'budget' | 'premium' | 'elite') => void;
}

const ALACARTE_SERVICES = [
  {
    category: "Branding Assets",
    items: [
      { name: "Logo Concept Suite", price: "$49", desc: "3 unique AI-generated logo variations." },
      { name: "Brand Voice & Strategy", price: "$29", desc: "Mission, vision, and identity keywords." },
      { name: "Business Card Design", price: "$39", desc: "Custom print-ready layout & QR setup." }
    ]
  },
  {
    category: "Digital Presence",
    items: [
      { name: "One-Page Landing Mockup", price: "$79", desc: "High-fidelity design for your domain." },
      { name: "Google Business Profile", price: "$149", desc: "Professional setup & map verification." },
      { name: "Cinematic Video Ad", price: "$59", desc: "6-second AI bumper ad for social." }
    ]
  },
  {
    category: "Physical Print",
    items: [
      { name: "500 Business Cards", price: "$65", desc: "Premium 16pt matte or glossy finish." },
      { name: "100 Vinyl Stickers", price: "$85", desc: "Die-cut weatherproof branding." },
      { name: "250 Glossy Flyers", price: "$95", desc: "8.5x11 high-impact marketing." }
    ]
  }
];

export const Pricing: React.FC<PricingProps> = ({ onSelectPackage }) => {
  const handlePurchaseService = (name: string, price: string) => {
    alert(`Individual Purchase Initiated:\nService: ${name}\nPrice: ${price}\n\nYou will be redirected to the secure checkout for this specific service.`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-lavender/10 rounded-full border border-brand-lavender/20">
          <Zap size={14} className="text-brand-lavender" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-lavender">Faith-Driven. Transparent. Excellent.</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-serif font-black text-brand-black leading-tight">
          Launch Your Brand<br/>
          <span className="text-stone-400">On Your Terms.</span>
        </h2>
        <p className="text-xl text-stone-500 max-w-3xl mx-auto font-medium">
          The most affordable elite branding in Central Florida. 10 precision-engineered packages. Agency results in 60 seconds, not 6 weeks.
        </p>
        <p className="text-sm text-stone-400 italic mt-2">"Whatever you do, work at it with all your heart, as working for the Lord." — Colossians 3:23</p>
      </div>

      {/* Main Bundles */}
      <div className="grid lg:grid-cols-3 gap-8 items-stretch mb-24">
        {/* Seedling Bundle (Budget) */}
        <div className="bg-white rounded-[3.5rem] p-10 border-2 border-stone-100 shadow-xl hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col group relative">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black font-serif text-brand-black">The Seedling</h3>
              <div className="px-3 py-1 bg-brand-teal/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-brand-tealDark inline-block">Starter</div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xs text-stone-400 font-bold line-through">$497</span>
                <span className="text-4xl font-black text-brand-black">$149</span>
              </div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">One-time · Save $348</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Includes 3 packages:</p>
            <p className="text-[10px] text-stone-500 italic">Promotion Pal · CardCut Calibrated · Sticker System</p>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            {[
              { text: "AI Logo Concepts (3 Variations)", icon: Star },
              { text: "Custom Color Palette & Typography", icon: Check },
              { text: "Business Card Design (Print-Ready PDF)", icon: Check },
              { text: "Vinyl Sticker Designs (Cricut-Ready)", icon: Check },
              { text: "Slogan & Mission Generation", icon: Check },
              { text: "LLC Naming Availability Scan", icon: Check }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-xs font-bold text-stone-700">
                <div className="p-1.5 rounded-full bg-stone-100 text-brand-teal"><item.icon size={12} /></div>
                {item.text}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelectPackage('budget')}
            className="w-full py-4 rounded-2xl bg-brand-black text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-brand-teal hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            Select Seedling <ChevronRight size={16} />
          </button>
        </div>

        {/* Growth Bundle (Premium) */}
        <div className="bg-white rounded-[3.5rem] p-10 border-2 border-brand-lavender/30 shadow-2xl hover:shadow-brand-lavender/10 transition-all duration-500 flex flex-col group relative scale-[1.05] z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-lavender text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">Most Popular</div>
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black font-serif text-brand-black">The Growth</h3>
              <div className="px-3 py-1 bg-brand-lavender/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-brand-lavender inline-block">Full Suite</div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xs text-stone-400 font-bold line-through">$1,497</span>
                <span className="text-4xl font-black text-brand-black">$249</span>
              </div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">One-time · Save $1,248</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Includes 3 packages:</p>
            <p className="text-[10px] text-stone-500 italic">Selling Sales Set · Registered Rebellion · Premiere Passion Pal</p>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            {[
              { text: "Everything in Seedling Package", icon: Zap },
              { text: "Full Marketing Strategy Suite", icon: Check },
              { text: "Flyer & Classified Ad Copy", icon: Check },
              { text: "Social Media Asset Pack", icon: Check },
              { text: "Email Marketing Templates (5)", icon: Check },
              { text: "30-Day Content Calendar", icon: Check },
              { text: "FL Business Launch Checklist", icon: Check }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-xs font-bold text-stone-700">
                <div className="p-1.5 rounded-full bg-brand-lavender/10 text-brand-lavender"><item.icon size={12} /></div>
                {item.text}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelectPackage('premium')}
            className="w-full py-5 rounded-2xl bg-brand-lavender text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-brand-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            Select Growth <ChevronRight size={16} />
          </button>
        </div>

        {/* Sovereign Bundle (Elite) */}
        <div className="bg-brand-black rounded-[3.5rem] p-10 border-2 border-brand-black shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-lavender/20 rounded-full blur-3xl"></div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="space-y-2">
              <h3 className="text-2xl font-black font-serif text-white">The Sovereign</h3>
              <div className="px-3 py-1 bg-brand-lavender rounded-lg text-[9px] font-black uppercase tracking-widest text-white inline-block">Elite Tier</div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xs text-stone-500 font-bold line-through">$4,997</span>
                <span className="text-4xl font-black text-white">$399</span>
              </div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">One-time · Save $4,598</p>
            </div>
          </div>

          <div className="mb-4 relative z-10">
            <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-2">Includes 4 packages:</p>
            <p className="text-[10px] text-stone-400 italic">The Sovereignty Set · Site Sales Solution · Entrepreneurship Enterprise · Ultimate Premium Suite</p>
          </div>
          <ul className="space-y-4 mb-10 flex-1 relative z-10">
            {[
              { text: "Everything in Growth Package", icon: Zap },
              { text: "Landing Page High-Fidelity Mockup", icon: Globe },
              { text: "Cinematic 1080p AI Video Ad", icon: Video },
              { text: "Full Sticker & Flyer Design Suite", icon: Check },
              { text: "Local Ad Strategy (Nextdoor/FB)", icon: Check },
              { text: "Competitor Analysis Report", icon: Check },
              { text: "Brand Guidelines Document", icon: FileText },
              { text: "Official Startup PDF Checklist", icon: FileText }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/90">
                <div className={`p-1.5 rounded-full ${i === 0 ? 'bg-brand-lavender text-white' : 'bg-white/10 text-brand-lavender'}`}><item.icon size={12} /></div>
                {item.text}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelectPackage('elite')}
            className="w-full py-5 rounded-2xl bg-brand-lavender text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-white hover:text-brand-lavender hover:scale-[1.02] transition-all flex items-center justify-center gap-2 relative z-10"
          >
            Claim Your Legacy <Rocket size={16} />
          </button>
        </div>
      </div>

      {/* Comparison Callout */}
      <div className="text-center mb-16 p-8 bg-stone-50 rounded-3xl border border-stone-200">
        <p className="text-lg font-serif font-bold text-brand-black mb-2">How do we keep prices this low?</p>
        <p className="text-sm text-stone-500">AI-powered generation means we deliver in minutes what takes agencies weeks. No bloated overhead, no middlemen — just elite results at honest prices. Custom packages available for unique needs.</p>
      </div>

      {/* A La Carte Section */}
      <div className="bg-stone-50 rounded-[4rem] p-12 md:p-20 border border-stone-200">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-serif font-black text-brand-black">A La Carte Services</h3>
          <p className="text-stone-500 font-medium mt-4">Only need one thing? Purchase any service individually.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {ALACARTE_SERVICES.map((section, idx) => (
            <div key={idx} className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-200 pb-4 ml-4">
                {section.category}
              </h4>
              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 hover:border-brand-teal hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-stone-900 text-sm leading-tight pr-4">{item.name}</span>
                      <span className="font-black text-brand-lavender text-sm">{item.price}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-medium mb-4 leading-relaxed">{item.desc}</p>
                    <button
                      onClick={() => handlePurchaseService(item.name, item.price)}
                      className="w-full py-2.5 rounded-xl border border-stone-200 text-[9px] font-black uppercase tracking-widest text-stone-500 group-hover:bg-brand-black group-hover:text-white group-hover:border-brand-black transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={12} /> Purchase Separately
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-stone-200 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-brand-lavender border border-stone-100">
                <Shield size={24} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Secure Payments</p>
                <p className="text-xs font-bold text-stone-700">Encrypted Stripe Checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-brand-teal border border-stone-100">
                <MessageCircle size={24} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Satisfaction Guarantee</p>
                <p className="text-xs font-bold text-stone-700">We work until you're proud of it</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-400 italic mt-8">"For I know the plans I have for you," declares the Lord. — Jeremiah 29:11</p>
        </div>
      </div>
    </div>
  );
};
