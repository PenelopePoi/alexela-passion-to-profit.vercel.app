
import React, { useState } from 'react';
import { BrandInput, BrandStrategy, BrandingPackage } from '../types';
import { 
  ShoppingBag, Check, Star, Zap, Shield, Globe, Package, Printer, 
  Scissors, MessageSquare, Copy, Sparkles, Loader2, Info, 
  DollarSign, FileText, Scale, AlertCircle, ChevronRight, ChevronDown,
  Music, Video, Layout, MousePointer, TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { generateSalesPitch } from '../services/geminiService';

interface BrandingPackagesProps {
  data: BrandStrategy;
  input: BrandInput;
  adAssets?: any;
  onPaymentRequest?: () => void;
}

export const BrandingPackages: React.FC<BrandingPackagesProps> = ({ data, input, adAssets, onPaymentRequest }) => {
  const [pitch, setPitch] = useState<string>('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isFriend, setIsFriend] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleGeneratePitch = async () => {
    setIsGeneratingPitch(true);
    try {
      const result = await generateSalesPitch(input, data, isFriend);
      setPitch(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const packages = data.packages || [];

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lavender/10 rounded-2xl">
              <ShoppingBag className="text-brand-lavender" />
            </div>
            <h2 className="text-4xl font-serif font-black text-brand-black tracking-tight">Elite Creative Studio</h2>
          </div>
          <p className="text-stone-500 font-medium max-w-2xl text-lg">
            High-conversion, emotionally impactful branding packages. Precision-engineered with <span className="text-brand-black font-bold">Cricut Explorer 3</span> and <span className="text-brand-black font-bold">HP Precision</span> technology.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-xl border border-stone-100">
          <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <Printer size={16} className="text-brand-teal" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">HP Precision</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <Scissors size={16} className="text-brand-lavender" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Cricut Cut</span>
          </div>
        </div>
      </div>

      {/* AI Ad Assets Section */}
      {adAssets && (
        <div className="glass rounded-[3rem] p-12 shadow-2xl border-white bg-white/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Sparkles size={150} className="text-brand-teal" />
          </div>
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-teal/10 rounded-2xl">
                <Zap className="text-brand-teal" />
              </div>
              <h3 className="text-2xl font-black text-brand-black">AI-Powered Ad Assets</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Video Concepts */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-lavender">
                  <Video size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Video Concepts</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[4, 5].map(i => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden border border-stone-100 shadow-sm relative group/vid">
                      <img 
                        src={`input_file_${i}.png`} 
                        alt="Video Preview" 
                        className="w-full h-full object-cover grayscale group-hover/vid:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('input_file_0.png')) {
                            target.src = 'input_file_0.png';
                          } else {
                            target.src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity">
                        <Video size={16} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
                {adAssets.videoConcepts?.map((v: any, i: number) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-stone-100 shadow-sm space-y-2">
                    <p className="text-xs font-black text-brand-black">{v.hook}</p>
                    <p className="text-[10px] text-stone-500 leading-tight">{v.visual}</p>
                  </div>
                ))}
              </div>

              {/* Song Concepts */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-teal">
                  <Music size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Songs</span>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden border border-stone-100 shadow-sm relative group/song mb-4">
                  <img 
                    src="input_file_6.png" 
                    alt="Audio Visualizer" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('input_file_0.png')) {
                        target.src = 'input_file_0.png';
                      } else {
                        target.src = 'https://images.unsplash.com/photo-1514525253344-f814d074358a?auto=format&fit=crop&q=80&w=800';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-brand-teal/20 flex items-center justify-center">
                    <div className="flex gap-1 items-end h-8">
                      {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [h*4, h*8, h*4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                          className="w-1 bg-white rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {adAssets.songConcepts?.map((s: any, i: number) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-stone-100 shadow-sm space-y-2">
                    <p className="text-xs font-black text-brand-black">{s.genre} - {s.mood}</p>
                    <p className="text-[10px] text-stone-500 italic">"{s.keyLyrics}"</p>
                  </div>
                ))}
              </div>

              {/* Scripts */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-black">
                  <FileText size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ad Scripts</span>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden border border-stone-100 shadow-sm bg-stone-50 flex items-center justify-center mb-4">
                   <FileText size={32} className="text-stone-200" />
                </div>
                {adAssets.scripts?.map((sc: any, i: number) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                    <p className="text-[10px] text-stone-600 line-clamp-3">{sc}</p>
                  </div>
                ))}
              </div>

              {/* Optimization */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <Layout size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Optimization</span>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden border border-stone-100 shadow-sm relative mb-4">
                  <img 
                    src="input_file_7.png" 
                    alt="Optimization" 
                    className="w-full h-full object-cover opacity-50"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('input_file_0.png')) {
                        target.src = 'input_file_0.png';
                      } else {
                        target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp size={32} className="text-orange-500" />
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                  <ul className="space-y-2">
                    {adAssets.optimizationTips?.map((tip: string, i: number) => (
                      <li key={i} className="text-[10px] text-stone-600 flex items-start gap-2">
                        <Check size={10} className="mt-1 text-green-500" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid lg:grid-cols-2 gap-10">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`relative glass rounded-[3rem] p-10 shadow-xl border-2 transition-all hover:shadow-2xl flex flex-col ${selectedPackage === pkg.id ? 'border-brand-lavender ring-4 ring-brand-lavender/10' : 'border-white'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${pkg.tier === 'Elite' ? 'bg-brand-lavender' : pkg.tier === 'Premium' ? 'bg-brand-teal' : 'bg-stone-200'} bg-opacity-10`}>
                    {pkg.tier === 'Elite' ? <Star className="text-brand-lavender" /> : pkg.tier === 'Premium' ? <Zap className="text-brand-teal" /> : <Package className="text-stone-500" />}
                  </div>
                  <h3 className="text-2xl font-black text-brand-black">{pkg.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pkg.tier === 'Elite' ? 'bg-brand-lavender text-white' : pkg.tier === 'Premium' ? 'bg-brand-teal text-white' : 'bg-stone-100 text-stone-500'}`}>
                    {pkg.tier} Tier
                  </span>
                  <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">• {pkg.timeline}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-brand-black">{pkg.price}</span>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Investment</p>
              </div>
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mb-8 font-medium">{pkg.description}</p>

            <div className="space-y-6 flex-1">
              {/* Deliverables */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Check size={14} className="text-brand-teal" /> Itemized Deliverables
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {pkg.deliverables.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="w-2 h-2 rounded-full bg-brand-teal opacity-40" />
                      <span className="text-xs font-bold text-stone-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Accordion */}
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)}
                  className="w-full flex items-center justify-between p-4 bg-brand-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-lavender transition-all"
                >
                  {selectedPackage === pkg.id ? 'Hide Details' : 'View Full Scope & Legal'}
                  {selectedPackage === pkg.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {selectedPackage === pkg.id && (
                  <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-200 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Production & Logic */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-black text-brand-lavender uppercase tracking-widest flex items-center gap-2">
                          <Printer size={12} /> Production Scope
                        </h5>
                        <p className="text-xs text-stone-600 leading-relaxed">{pkg.productionScope}</p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-black text-brand-teal uppercase tracking-widest flex items-center gap-2">
                          <DollarSign size={12} /> Pricing Logic
                        </h5>
                        <p className="text-xs text-stone-600 leading-relaxed">{pkg.pricingLogic}</p>
                      </div>
                    </div>

                    {/* Legitimacy Checklist */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-brand-black uppercase tracking-widest flex items-center gap-2">
                        <Shield size={14} className="text-brand-teal" /> Business Legitimacy Checklist (Florida-Compliant)
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {pkg.legitimacyChecklist.map((check, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-stone-500">
                            <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center">
                              <Check size={10} className="text-green-600" />
                            </div>
                            {check}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Budget Breakdown */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-brand-black uppercase tracking-widest flex items-center gap-2">
                        <DollarSign size={14} className="text-brand-lavender" /> Budget Breakdown
                      </h5>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Startup', val: pkg.budgetBreakdown.startup },
                          { label: 'Production', val: pkg.budgetBreakdown.production },
                          { label: 'Marketing', val: pkg.budgetBreakdown.marketing },
                          { label: 'Scaling', val: pkg.budgetBreakdown.scaling }
                        ].map((b, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-stone-100">
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">{b.label}</p>
                            <p className="text-xs font-black text-brand-black">{b.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="space-y-4 pt-4 border-t border-stone-200">
                      <h5 className="text-[10px] font-black text-brand-black uppercase tracking-widest flex items-center gap-2">
                        <Scale size={14} className="text-stone-400" /> Terms of Service & Agreement
                      </h5>
                      <div className="grid gap-4">
                        <div className="text-[10px] text-stone-500 leading-relaxed">
                          <span className="font-black text-stone-700">Scope:</span> {pkg.terms.scope}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-[9px] text-stone-500">
                            <span className="font-black text-stone-700 uppercase">Revisions:</span> {pkg.terms.revisions}
                          </div>
                          <div className="text-[9px] text-stone-500">
                            <span className="font-black text-stone-700 uppercase">IP Rights:</span> {pkg.terms.ip}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onPaymentRequest?.()}
              className={`w-full mt-8 py-5 rounded-2xl text-white font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 ${pkg.tier === 'Elite' ? 'bg-brand-lavender' : pkg.tier === 'Premium' ? 'bg-brand-teal' : 'bg-brand-black'}`}
            >
              Select {pkg.name}
            </button>
          </div>
        ))}
      </div>

      {/* Sales Pitch Generator */}
      <div className="glass rounded-[3rem] p-12 shadow-2xl border-white bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5">
            <MessageSquare size={120} className="text-brand-lavender" />
        </div>
        
        <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-brand-black flex items-center gap-3">
                        <Sparkles className="text-brand-lavender" /> Personalized Sales Pitch
                    </h3>
                    <p className="text-stone-500 text-sm font-medium">Generate a high-converting message to send to your potential clients.</p>
                </div>
                <div className="flex items-center gap-4 bg-stone-100 p-2 rounded-2xl">
                    <button 
                        onClick={() => setIsFriend(true)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFriend ? 'bg-white text-brand-black shadow-sm' : 'text-stone-400'}`}
                    >
                        Friend Discount
                    </button>
                    <button 
                        onClick={() => setIsFriend(false)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isFriend ? 'bg-white text-brand-black shadow-sm' : 'text-stone-400'}`}
                    >
                        Standard Rate
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <button 
                    onClick={handleGeneratePitch}
                    disabled={isGeneratingPitch}
                    className="flex items-center gap-3 px-8 py-4 bg-brand-black text-white rounded-2xl font-black text-sm hover:bg-brand-lavender transition-all disabled:opacity-50"
                >
                    {isGeneratingPitch ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    {pitch ? 'Regenerate Pitch' : 'Generate Custom Pitch'}
                </button>

                {pitch && (
                    <div className="relative group">
                        <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100 text-stone-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                            {pitch}
                        </div>
                        <button 
                            onClick={copyToClipboard}
                            className="absolute top-4 right-4 p-3 bg-white rounded-xl shadow-md border border-stone-100 text-stone-400 hover:text-brand-teal transition-all"
                            title="Copy to Clipboard"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Ethical Standards & Quality Control */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[3rem] border-white shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-2xl">
              <Shield className="text-green-600" />
            </div>
            <h4 className="text-xl font-black text-brand-black">Ethical Standards</h4>
          </div>
          <ul className="space-y-4">
            {[
              "Honest marketing practices only",
              "No deceptive or manipulative tactics",
              "Deep respect for customer needs & goals",
              "Unwavering professional integrity"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold text-stone-600">
                <Check size={16} className="text-green-500" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass p-10 rounded-[3rem] border-white shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lavender/10 rounded-2xl">
              <AlertCircle className="text-brand-lavender" />
            </div>
            <h4 className="text-xl font-black text-brand-black">Quality Control</h4>
          </div>
          <p className="text-sm text-stone-500 font-medium leading-relaxed">
            Every deliverable undergoes a rigorous "Taste Test" to ensure it meets our Maximum Output Standard. We ask: Does this generate leads? Does this impress instantly? Would a customer feel proud owning this?
          </p>
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-lavender/10 rounded-xl w-fit">
            <Sparkles size={14} className="text-brand-lavender" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">100% Satisfaction Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
