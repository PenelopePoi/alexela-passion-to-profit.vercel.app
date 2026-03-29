
import React, { useState } from 'react';
import { BrandStrategy, BrandInput } from '../types';
import { Sparkles, Phone, Mail, MapPin, Globe, CreditCard, RotateCw, Layout, Paintbrush, Move, Type, Maximize2, Scissors, ExternalLink, Printer, QrCode, User, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { XelaLogo } from './XelaLogo';

interface BusinessCardProps {
  data: BrandStrategy;
  input: BrandInput;
  logoUrl?: string;
}

type CardLayout = 'modern-split' | 'minimal-center' | 'vertical-corporate' | 'bold-dark' | 'artsy-asymmetric' | 'classic-elegant' | 'xela-advantage';
type CardFinish = 'matte' | 'glossy' | 'kraft' | 'linen' | 'wood-grain' | 'metallic';
type CornerStyle = 'square' | 'rounded' | 'leaf';
type CardTheme = 'brand' | 'monochrome' | 'vibrant' | 'earthy' | 'luxury' | 'midnight';

export const BusinessCard: React.FC<BusinessCardProps> = ({ data, input, logoUrl }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [layout, setLayout] = useState<CardLayout>('artsy-asymmetric');
  const [finish, setFinish] = useState<CardFinish>('matte');
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>('rounded');
  const [theme, setTheme] = useState<CardTheme>('brand');
  const [selectedTagline, setSelectedTagline] = useState(data.taglines[0]);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [qrType, setQrType] = useState<BrandInput['qrPreference']>(input.qrPreference || 'website');
  const [editableDetails, setEditableDetails] = useState({
    email: input.email || `hello@${input.companyName.toLowerCase().replace(/\s/g, '')}.com`,
    website: input.website || `www.${input.companyName.toLowerCase().replace(/\s/g, '')}.com`,
    phone: input.phone || "(555) 123-4567",
    owner: input.ownerName || "Founder",
    location: input.location || "Florida, USA"
  });
  const [showEditor, setShowEditor] = useState(false);

  const getQrUrl = () => {
    let target = editableDetails.website;
    if (qrType === 'google') target = input.googleBusinessLink || editableDetails.website;
    if (qrType === 'booking') target = input.bookingLink || editableDetails.website;
    if (qrType === 'contact') target = `tel:${editableDetails.phone}`;
    
    const qrColor = data.colorPalette.primary.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(target)}&color=${qrColor}&bgcolor=ffffff`;
  };

  const finishes: Record<CardFinish, string> = {
    matte: 'bg-white',
    glossy: 'bg-gradient-to-br from-white via-white to-stone-100',
    kraft: 'bg-[#d2b48c]',
    linen: 'bg-[#f4f1ea]',
    'wood-grain': 'bg-[#6d4c41]',
    metallic: 'bg-gradient-to-br from-stone-100 via-white to-stone-300'
  };

  const finishOverlays: Record<CardFinish, React.ReactNode> = {
    matte: <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>,
    glossy: <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-50 skew-x-12"></div>,
    kraft: <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")'}}></div>,
    linen: <div className="absolute inset-0 opacity-30 pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/white-linen.png")'}}></div>,
    'wood-grain': <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}></div>,
    metallic: <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-60 pointer-events-none animate-pulse-slow"></div>
  };

  const cornerClasses: Record<CornerStyle, string> = {
    square: 'rounded-none',
    rounded: 'rounded-[2rem]',
    leaf: 'rounded-tl-[4rem] rounded-br-[4rem] rounded-tr-[1rem] rounded-bl-[1rem]'
  };

  const isDark = layout === 'bold-dark' || finish === 'wood-grain' || theme === 'midnight';

  const themes: Record<CardTheme, { primary: string, secondary: string, accent: string, bg: string }> = {
    brand: { 
      primary: data.colorPalette.primary, 
      secondary: data.colorPalette.secondary, 
      accent: data.colorPalette.accent,
      bg: finish === 'matte' ? 'bg-white' : finishes[finish]
    },
    monochrome: { primary: '#1a1a1a', secondary: '#4a4a4a', accent: '#8a8a8a', bg: 'bg-white' },
    vibrant: { primary: '#6366f1', secondary: '#ec4899', accent: '#f59e0b', bg: 'bg-white' },
    earthy: { primary: '#3f6212', secondary: '#854d0e', accent: '#b45309', bg: 'bg-[#fdfcf0]' },
    luxury: { primary: '#1c1917', secondary: '#78350f', accent: '#fbbf24', bg: 'bg-[#fafaf9]' },
    midnight: { primary: '#ffffff', secondary: '#94a3b8', accent: '#38bdf8', bg: 'bg-[#0f172a]' }
  };

  const activeTheme = themes[theme];

  return (
    <div className="glass rounded-[3.5rem] p-8 md:p-12 shadow-2xl border-white relative overflow-hidden flex flex-col lg:flex-row gap-8 items-start">
       {/* Detailed Settings Panel */}
       <div className="w-full lg:w-80 space-y-6 flex-shrink-0 bg-white/40 p-6 rounded-[2.5rem] border border-white/50 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-3 mb-2">
                <CreditCard size={18} className="text-orange-500" /> Card Studio
            </h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Premium Customization</p>
          </div>

          <div className="space-y-4">
              {/* QR Code Selection */}
              <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                      <QrCode size={12} /> QR Link Target
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'website', label: 'Website', icon: Globe },
                        { id: 'google', label: 'Google Maps', icon: MapPin },
                        { id: 'booking', label: 'Booking', icon: Calendar },
                        { id: 'contact', label: 'Contact', icon: Phone }
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            onClick={() => setQrType(btn.id as any)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${qrType === btn.id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-stone-400 border-stone-100'}`}
                        >
                            <btn.icon size={10} /> {btn.label}
                        </button>
                    ))}
                  </div>
              </div>

              {/* Tagline Selection */}
              <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                      <Type size={12} /> Front Tagline
                  </label>
                  <select 
                    value={selectedTagline}
                    onChange={(e) => setSelectedTagline(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-100 text-[10px] font-bold text-stone-700 focus:outline-none focus:border-orange-300"
                  >
                      {data.taglines.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                      ))}
                  </select>
              </div>

              {/* Layout & Style */}
              <div className="space-y-4">
                  <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                          <Layout size={12} /> Design Layout
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'artsy-asymmetric', label: 'Artsy' },
                          { id: 'modern-split', label: 'Split' },
                          { id: 'minimal-center', label: 'Center' },
                          { id: 'vertical-corporate', label: 'Corp' },
                          { id: 'bold-dark', label: 'Bold' },
                          { id: 'classic-elegant', label: 'Classic' },
                          { id: 'xela-advantage', label: 'Xela' }
                        ].map(l => (
                          <button 
                            key={l.id}
                            onClick={() => setLayout(l.id as any)}
                            className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${layout === l.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100'}`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                          <RotateCw size={12} /> View
                      </label>
                      <button onClick={() => setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape')} className="w-full p-2 rounded-xl bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest">
                          {orientation}
                      </button>
                  </div>
              </div>

              {/* Material Finish */}
              <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                      <Paintbrush size={12} /> Paper Finish
                  </label>
                  <div className="flex flex-wrap gap-2">
                      {(['matte', 'glossy', 'kraft', 'linen', 'wood-grain', 'metallic'] as CardFinish[]).map((f) => (
                          <button 
                            key={f}
                            onClick={() => setFinish(f)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${finish === f ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100'}`}
                          >
                              {f.replace('-', ' ')}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Color Themes */}
              <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                      <Sparkles size={12} /> Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                      {(['brand', 'monochrome', 'vibrant', 'earthy', 'luxury', 'midnight'] as CardTheme[]).map((t) => (
                          <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${theme === t ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-stone-400 border-stone-100'}`}
                          >
                              {t}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="space-y-2">
                  <button 
                    onClick={() => setShowEditor(!showEditor)}
                    className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-stone-900 border border-stone-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Type size={14} /> {showEditor ? 'Hide Editor' : 'Edit Details'}
                  </button>
              </div>

              <AnimatePresence>
                {showEditor && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-stone-400">Owner Name</label>
                      <input 
                        type="text" 
                        value={editableDetails.owner}
                        onChange={(e) => setEditableDetails({...editableDetails, owner: e.target.value})}
                        className="w-full p-2 rounded-lg bg-white border border-stone-100 text-[10px] font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-stone-400">Phone</label>
                      <input 
                        type="text" 
                        value={editableDetails.phone}
                        onChange={(e) => setEditableDetails({...editableDetails, phone: e.target.value})}
                        className="w-full p-2 rounded-lg bg-white border border-stone-100 text-[10px] font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-stone-400">Email</label>
                      <input 
                        type="email" 
                        value={editableDetails.email}
                        onChange={(e) => setEditableDetails({...editableDetails, email: e.target.value})}
                        className="w-full p-2 rounded-lg bg-white border border-stone-100 text-[10px] font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-stone-400">Website</label>
                      <input 
                        type="text" 
                        value={editableDetails.website}
                        onChange={(e) => setEditableDetails({...editableDetails, website: e.target.value})}
                        className="w-full p-2 rounded-lg bg-white border border-stone-100 text-[10px] font-bold"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                <button onClick={() => setIsFlipped(!isFlipped)} className="w-full py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                    <RotateCw size={14} className={isFlipped ? 'rotate-180 transition-transform' : 'transition-transform'} /> Flip Design
                </button>
                <a href="https://www.avery.com/custom-printing/business-cards" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-stone-900 border border-stone-200 transition-all flex items-center justify-center gap-2">
                  <Printer size={14} /> Print with Avery™
                </a>
              </div>
          </div>
       </div>

       {/* Interactive Card Preview Area */}
       <div className="flex-1 flex items-center justify-center py-4 w-full min-h-[450px]">
          <div 
            className={`w-full max-w-[500px] aspect-[1.75/1] perspective-1000 cursor-pointer group transition-all duration-700 ${orientation === 'portrait' ? 'max-w-[320px] aspect-[1/1.75]' : ''}`} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full duration-1000 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* FRONT SIDE */}
              <div 
                  className={`absolute w-full h-full backface-hidden ${cornerClasses[cornerStyle]} shadow-2xl overflow-hidden border border-black/5 flex flex-col p-10 transition-all duration-500 ${isDark ? 'text-white' : 'text-stone-800'} ${activeTheme.bg}`}
              >
                  {finishOverlays[finish]}
                  
                  {layout === 'artsy-asymmetric' && (
                      <div className="h-full relative z-10 flex flex-col justify-between p-2">
                          {/* Background Decorative Elements */}
                          <div className="absolute -top-10 -right-10 w-48 h-48 opacity-20 blur-2xl rounded-full" style={{ backgroundColor: activeTheme.accent }}></div>
                          <div className="absolute -bottom-10 -left-10 w-32 h-32 opacity-10 blur-xl rounded-full" style={{ backgroundColor: activeTheme.primary }}></div>
                          
                          <div className="flex justify-between items-start relative">
                              <div className="relative">
                                  <div className="absolute -inset-2 bg-stone-100/50 rounded-3xl blur-sm -rotate-12 group-hover:rotate-0 transition-transform"></div>
                                  <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-2xl border border-stone-100/50 overflow-hidden transform -rotate-12 transition-all duration-500 group-hover:rotate-0 group-hover:scale-110 relative z-10">
                                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-4xl font-serif font-black flex items-center justify-center h-full" style={{ color: activeTheme.primary }}>{input.companyName.charAt(0)}</span>}
                                  </div>
                              </div>
                              
                              <div className="text-right mt-2">
                                  <h2 className="text-3xl font-serif font-black tracking-tighter leading-none mb-1" style={{ color: activeTheme.primary }}>
                                      {input.companyName}
                                  </h2>
                                  <div className="flex justify-end items-center gap-2">
                                      <div className="h-px w-8 bg-stone-300"></div>
                                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">{input.industry}</p>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-auto">
                              <div className="max-w-[70%]">
                                  <p className="text-xl font-serif italic font-bold leading-tight tracking-tight" style={{ color: isDark ? 'white' : activeTheme.secondary }}>
                                      {selectedTagline}
                                  </p>
                                  <div className="h-1.5 w-16 rounded-full mt-4 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${activeTheme.accent}, transparent)` }}></div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1 opacity-40">
                                  <span className="text-[7px] font-black uppercase tracking-widest text-stone-400">Established</span>
                                  <span className="text-[10px] font-serif italic font-bold" style={{ color: activeTheme.primary }}>{input.yearsExperience || '2024'}</span>
                              </div>
                          </div>
                      </div>
                  )}

                  {layout === 'modern-split' && (
                    <div className={`h-full flex ${orientation === 'portrait' ? 'flex-col gap-6' : 'flex-row justify-between'} items-start relative z-10`}>
                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center p-2 backdrop-blur-md shadow-xl overflow-hidden border border-white/20">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className={`w-full h-full object-cover rounded-xl ${isDark ? 'filter brightness-110 contrast-110' : ''}`} />
                            ) : (
                                <span className="text-2xl font-serif font-black">{input.companyName.charAt(0)}</span>
                            )}
                        </div>
                        <div className={`${orientation === 'portrait' ? 'text-left' : 'text-right'} flex-1 pl-4`}>
                            <h2 className="text-2xl font-serif font-black tracking-tight leading-none mb-1" style={{ color: isDark ? 'white' : activeTheme.primary }}>{input.companyName}</h2>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{input.industry}</p>
                            <div className={`h-1 w-12 rounded-full mt-4 ${orientation === 'portrait' ? 'mr-auto' : 'ml-auto'}`} style={{ backgroundColor: activeTheme.secondary }}></div>
                            <p className="text-xs font-serif font-bold italic mt-6 opacity-80 leading-relaxed">{selectedTagline}</p>
                        </div>
                    </div>
                  )}

                  {layout === 'minimal-center' && (
                      <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                         <div className="w-24 h-24 mb-6 flex items-center justify-center shadow-2xl rounded-3xl overflow-hidden bg-white">
                            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-4xl font-serif font-black">{input.companyName.charAt(0)}</span>}
                         </div>
                         <h2 className="text-2xl font-serif font-black mb-2">{input.companyName}</h2>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50" style={{ color: isDark ? 'white' : activeTheme.primary }}>{selectedTagline}</p>
                      </div>
                  )}

                  {layout === 'vertical-corporate' && (
                      <div className="h-full flex flex-col relative z-10">
                          <div className={`flex items-center justify-center border-b border-white/10 ${orientation === 'portrait' ? 'h-1/3' : 'h-1/2'}`}>
                             {logoUrl ? <img src={logoUrl} alt="Logo" className="h-20 w-20 object-cover rounded-full border-4 border-white shadow-xl" /> : <span className="text-5xl font-serif font-black">{input.companyName.charAt(0)}</span>}
                          </div>
                          <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                              <h2 className="text-xl font-serif font-black leading-tight mb-2 uppercase tracking-tighter" style={{ color: activeTheme.primary }}>{input.companyName}</h2>
                              <div className="h-1 w-12 bg-current opacity-20 mb-4" style={{ backgroundColor: activeTheme.accent }}></div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-relaxed">{selectedTagline}</p>
                          </div>
                      </div>
                  )}

                  {layout === 'bold-dark' && (
                      <div className="h-full flex flex-col justify-center items-center relative z-10">
                          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
                          <div className="relative mb-6">
                            {logoUrl ? <img src={logoUrl} alt="Logo" className="h-24 w-24 object-cover rounded-full border-4 border-white/20 shadow-2xl" /> : <span className="text-5xl font-serif font-black text-white">{input.companyName.charAt(0)}</span>}
                          </div>
                          <h2 className="text-3xl font-serif font-black tracking-tighter italic text-center">{input.companyName}</h2>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-40">{selectedTagline}</p>
                          <div className="h-0.5 w-12 bg-white/20 mt-6 rounded-full"></div>
                      </div>
                  )}

                  {layout === 'classic-elegant' && (
                      <div className="h-full flex flex-col items-center justify-center relative z-10 p-6 border-4 border-double" style={{ borderColor: activeTheme.accent }}>
                          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: activeTheme.primary }}></div>
                          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: activeTheme.primary }}></div>
                          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: activeTheme.primary }}></div>
                          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: activeTheme.primary }}></div>
                          
                          <div className="mb-4">
                              {logoUrl ? <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain" /> : <span className="text-3xl font-serif font-bold text-stone-800">{input.companyName.charAt(0)}</span>}
                          </div>
                          <h2 className="text-2xl font-serif font-bold tracking-widest text-center uppercase" style={{ color: activeTheme.primary }}>{input.companyName}</h2>
                          <div className="h-px w-16 my-3" style={{ backgroundColor: activeTheme.accent }}></div>
                          <p className="text-[9px] font-serif italic text-stone-600 text-center">{selectedTagline}</p>
                      </div>
                  )}
                  {layout === 'xela-advantage' && (
                      <div className="h-full flex flex-col items-center justify-center relative z-10 bg-brand-black text-white p-6">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lavender rounded-full blur-3xl opacity-20"></div>
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-teal rounded-full blur-3xl opacity-20"></div>
                          
                          <div className="mb-4">
                              <XelaLogo className="h-12" color="white" />
                          </div>
                          <h2 className="text-xl font-bold uppercase tracking-widest text-brand-lavender mb-2">The Advantage</h2>
                          <p className="text-[10px] text-stone-400 text-center max-w-[200px] leading-relaxed">
                              Powered by AI. Built for Speed. Designed for Success.
                          </p>
                          <div className="mt-6 flex items-center gap-2">
                              <div className="h-1 w-1 bg-brand-teal rounded-full"></div>
                              <div className="h-1 w-1 bg-brand-lavender rounded-full"></div>
                              <div className="h-1 w-1 bg-brand-lavender rounded-full opacity-50"></div>
                          </div>
                      </div>
                  )}
              </div>

              {/* BACK SIDE */}
              <div 
                  className={`absolute w-full h-full backface-hidden rotate-y-180 ${cornerClasses[cornerStyle]} shadow-2xl overflow-hidden bg-white flex flex-col p-10 border border-stone-200`}
              >
                  {finishOverlays[finish]}
                  <div className="flex-1 relative z-10 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-8">
                           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center p-0.5 border border-stone-100 shadow-md overflow-hidden">
                            {logoUrl ? <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" /> : <span className="font-serif font-black text-xl">{input.companyName.charAt(0)}</span>}
                           </div>
                           <div>
                              <h3 className="text-xl font-serif font-black leading-none mb-1" style={{color: activeTheme.primary}}>{input.companyName}</h3>
                              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black italic">Crafted by {editableDetails.owner}</p>
                           </div>
                      </div>
                      
                      <div className="space-y-3.5 text-xs text-stone-700 pl-1 font-bold">
                          <div className="flex items-center gap-4 group/item">
                              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover/item:text-orange-500 transition-colors shadow-sm"><Phone size={14} /></div>
                              <span className="text-sm font-sans tracking-tight">{editableDetails.phone}</span>
                          </div>
                          <div className="flex items-center gap-4 group/item">
                              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover/item:text-orange-500 transition-colors shadow-sm"><Mail size={14} /></div>
                              <span className="truncate text-stone-500">{editableDetails.email}</span>
                          </div>
                          <div className="flex items-center gap-4 group/item">
                              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover/item:text-orange-500 transition-colors shadow-sm"><Globe size={14} /></div>
                              <span className="truncate text-stone-500">{editableDetails.website}</span>
                          </div>
                          <div className="flex items-center gap-4 group/item">
                              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover/item:text-orange-500 transition-colors shadow-sm"><MapPin size={14} /></div>
                              <span className="truncate text-stone-400 font-medium">{editableDetails.location}</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* QR Code Section */}
                  <div className="absolute bottom-10 right-10 bg-white p-2.5 rounded-[2rem] border border-stone-100 shadow-2xl group-hover:scale-110 transition-transform z-20 text-center ring-4 ring-stone-50">
                     <img 
                       src={getQrUrl()} 
                       alt="QR Code" 
                       className="w-16 h-16 object-contain mix-blend-multiply opacity-90"
                     />
                     <div className="text-[7px] font-black uppercase tracking-tighter mt-1.5 text-stone-300">
                        {qrType === 'website' ? 'Explore Site' : qrType === 'google' ? 'Visit Us' : qrType === 'booking' ? 'Book Consult' : 'Call Directly'}
                     </div>
                  </div>

                  <div className="h-2 w-full mt-auto rounded-full relative z-10" style={{ background: `linear-gradient(to right, ${activeTheme.primary}, ${activeTheme.secondary}, ${activeTheme.accent})`}}></div>
              </div>
            </div>
          </div>
       </div>

       <div className="absolute bottom-8 right-8 flex items-center gap-2 opacity-30">
           <Move size={14} className="text-stone-400" />
           <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Interactive Designer Studio</span>
       </div>
    </div>
  );
};
