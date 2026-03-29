
import React, { useState } from 'react';
import { BrandStrategy, BrandInput } from '../types';
import { Printer, Scissors, Download, Sparkles, Layout, Loader2, StickyNote, Edit3, MessageCircle, Copy, ShoppingCart, Grid, Maximize, FileCheck, ScanLine, QrCode, Globe, MapPin, Calendar, Phone, Zap, Paintbrush, Palette, RefreshCw, CheckCircle } from 'lucide-react';
import { jsPDF } from "jspdf";
import { generateFlyerCopy, generateClassifiedAd, generateStickerSlogans, generateBrandStory } from '../services/geminiService';

interface MarketingMaterialsProps {
  data: BrandStrategy;
  input: BrandInput;
  logoUrl?: string;
  onUpdateStrategy: (updated: Partial<BrandStrategy>) => void;
}

type StickerFinish = 'matte' | 'glossy' | 'holographic';

export const MarketingMaterials: React.FC<MarketingMaterialsProps> = ({ data, input, logoUrl, onUpdateStrategy }) => {
  const [activeTab, setActiveTab] = useState<'flyer' | 'sticker' | 'cards' | 'classifieds' | 'window'>('flyer');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [isGeneratingStickerText, setIsGeneratingStickerText] = useState(false);
  const [isGeneratingBrandStory, setIsGeneratingBrandStory] = useState(false);
  const [classifiedAd, setClassifiedAd] = useState<{title: string, body: string} | null>(null);
  
  // Customization state
  const [stickerText, setStickerText] = useState(input.companyName);
  const [stickerStyle, setStickerStyle] = useState<'round' | 'square' | 'diecut'>('round');
  const [stickerFinish, setStickerFinish] = useState<StickerFinish>('glossy');
  const [stickerBgColor, setStickerBgColor] = useState('#ffffff');
  const [viewMode, setViewMode] = useState<'single' | 'sheet'>('single');
  const [qrTarget, setQrTarget] = useState<BrandInput['qrPreference']>(input.qrPreference || 'website');
  const [stickerSuggestions, setStickerSuggestions] = useState<string[]>([]);

  const phone = input.phone || "(555) 123-4567";
  const website = input.website || `www.${input.companyName.toLowerCase().replace(/\s/g, '')}.com`;
  const owner = input.ownerName || "Founder";

  const getQrUrl = () => {
    let target = website;
    if (qrTarget === 'google') target = input.googleBusinessLink || website;
    if (qrTarget === 'booking') target = input.bookingLink || website;
    if (qrTarget === 'contact') target = `tel:${phone}`;
    
    const qrColor = data.colorPalette.primary.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(target)}&color=${qrColor}&bgcolor=ffffff`;
  };

  const handleGenerateCopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const copy = await generateFlyerCopy(input, data);
      onUpdateStrategy({ flyerCopy: copy });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleGenerateStickerText = async () => {
      setIsGeneratingStickerText(true);
      try {
          const suggestions = await generateStickerSlogans(input.industry, input.companyName);
          setStickerSuggestions(suggestions);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingStickerText(false);
      }
  };

  const handleGenerateClassified = async () => {
      setIsGeneratingAd(true);
      try {
          const ad = await generateClassifiedAd(input, data);
          setClassifiedAd(ad);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingAd(false);
      }
  };

  const handleGenerateBrandStory = async () => {
      setIsGeneratingBrandStory(true);
      try {
          const story = await generateBrandStory(input, data);
          onUpdateStrategy({ brandStory: story });
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingBrandStory(false);
      }
  };

  const handleDownloadFlyer = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(data.colorPalette.primary);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(input.companyName, pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.text(data.taglines[0], pageWidth / 2, 35, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text(data.flyerCopy?.headline || "Expert Service", 20, 70);
    doc.setFontSize(12);
    doc.text(data.flyerCopy?.hook || "Quality you can trust.", 20, 85, { maxWidth: 170 });
    
    // Attempt to add logo if it's a data URL
    if (logoUrl && logoUrl.startsWith('data:image')) {
        try {
            doc.addImage(logoUrl, 'PNG', 10, 10, 30, 30);
        } catch (e) { console.warn("Could not add logo to PDF", e); }
    }

    doc.save(`${input.companyName}_Flyer.pdf`);
  };

  const handleDownloadSticker = () => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [100, 100]
    });
    
    // Background
    if (stickerStyle !== 'diecut') {
        doc.setFillColor(stickerBgColor);
        if (stickerStyle === 'round') {
            doc.circle(50, 50, 48, 'F');
        } else {
            doc.rect(2, 2, 96, 96, 'F');
        }
    } else {
         // Diecut simulation (simplified for PDF)
         doc.setFillColor(255, 255, 255);
         doc.circle(50, 50, 45, 'F');
    }

    // Text & Content
    doc.setTextColor(data.colorPalette.primary);
    doc.setFontSize(16);
    const splitTitle = doc.splitTextToSize(stickerText, 80);
    doc.text(splitTitle, 50, 55, { align: 'center', baseline: 'middle' });

    if (logoUrl && logoUrl.startsWith('data:image')) {
        try {
           doc.addImage(logoUrl, 'PNG', 35, 10, 30, 30);
        } catch(e) { console.warn("Could not add logo to sticker PDF", e); }
    }

    doc.save(`${input.companyName}_Sticker.pdf`);
  };

  const handleOrderPrint = (item: string, price: string) => {
    alert(`Order initiated for ${item} (${price}). This would connect to your payment gateway.`);
  };

  const renderStickerContent = (small = false) => {
    const isDieCut = stickerStyle === 'diecut';
    
    const shapeClasses = {
        round: 'rounded-full aspect-square',
        square: 'rounded-2xl aspect-square',
        // Improved diecut shape using a custom radius blob effect
        diecut: 'rounded-[3rem] aspect-square shadow-[0_0_0_4px_white,0_10px_15px_-3px_rgba(0,0,0,0.2)]' 
    };

    const finishOverlays = {
        matte: <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>,
        glossy: <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent skew-x-12 opacity-50"></div>,
        holographic: <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 via-blue-200/30 to-green-200/30 mix-blend-overlay animate-pulse-slow"></div>
    };

    const currentBg = isDieCut ? 'white' : stickerBgColor;

    return (
        <div 
            className={`relative transition-all duration-700 transform flex flex-col items-center justify-center text-center overflow-hidden ${small ? 'w-full h-full p-2 border-stone-100' : 'w-72 h-72 p-10'} ${shapeClasses[stickerStyle]} group/sticker`}
            style={{ 
                backgroundColor: currentBg, 
                // Add a border if it's white to make it visible against white background
                border: (!isDieCut && currentBg === '#ffffff') ? '1px solid #e5e5e5' : 'none',
                // Specific styling for diecut to make it look "cut"
                clipPath: isDieCut ? 'polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)' : 'none'
            }}
        >
            {finishOverlays[stickerFinish]}
            
            <div className="absolute inset-0 opacity-[0.03] z-0" style={{backgroundColor: data.colorPalette.primary}}></div>
            
            <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
                {logoUrl && <img src={logoUrl} alt="Sticker" className={`${small ? 'w-8 h-8' : 'w-24 h-24'} object-contain mb-3 drop-shadow-md`} />}
                <h4 className={`${small ? 'text-[6px]' : 'text-xl'} font-black font-serif italic tracking-tight leading-tight px-2 break-words max-w-full`} style={{color: data.colorPalette.primary}}>
                    {stickerText}
                </h4>
                {!small && (
                    <div className="mt-4 pt-4 border-t border-black/5 w-full">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{input.location}</p>
                    </div>
                )}
            </div>
            
            {/* Cut Line Indicator for non-diecut */}
            {!small && !isDieCut && (
                <div className={`absolute inset-0 border-2 border-dashed border-stone-400/20 opacity-0 group-hover/sticker:opacity-100 transition-opacity pointer-events-none ${stickerStyle === 'round' ? 'rounded-full' : 'rounded-2xl'}`}></div>
            )}
        </div>
    );
  };

  const renderBusinessCardContent = () => (
      <div className="w-full h-full bg-white relative overflow-hidden flex flex-col items-center justify-center text-center p-4 border border-stone-100">
          <div className="absolute top-0 left-0 w-full h-1" style={{backgroundColor: data.colorPalette.primary}}></div>
          {logoUrl ? (
              <img src={logoUrl} className="h-8 w-8 object-contain mb-2" />
          ) : (
              <div className="text-xl font-black font-serif" style={{color: data.colorPalette.primary}}>{input.companyName.charAt(0)}</div>
          )}
          <div className="text-[8px] font-black uppercase tracking-widest text-stone-800">{input.companyName}</div>
          <div className="text-[6px] text-stone-500 mt-1">{phone}</div>
      </div>
  );

  return (
    <div className="glass rounded-[3rem] shadow-xl border-white overflow-hidden flex flex-col animate-fade-in-up">
       <div className="p-6 border-b border-stone-100 bg-white/40 flex justify-between items-center flex-wrap gap-4">
           <h3 className="font-bold text-stone-900 flex items-center gap-2">
               <div className="p-2 bg-stone-900 text-white rounded-xl">
                   <Printer size={18} />
               </div>
               Marketing Studio
           </h3>
           <div className="flex bg-stone-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
               {['flyer', 'sticker', 'cards', 'window', 'classifieds', 'xela'].map((tab) => (
                   <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400'}`}>
                       {tab === 'xela' ? 'Xela Advantage' : tab}
                   </button>
               ))}
           </div>
       </div>

       {/* QR Target Switcher (Global for Studio) */}
       <div className="px-6 py-4 bg-white/40 border-b border-stone-100 flex items-center gap-4 flex-wrap">
           <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2"><QrCode size={12}/> Global QR Link:</span>
           <div className="flex gap-2">
               {[
                   { id: 'website', label: 'Website', icon: Globe },
                   { id: 'google', label: 'Google Business', icon: MapPin },
                   { id: 'booking', label: 'Booking', icon: Calendar }
               ].map(btn => (
                   <button 
                       key={btn.id}
                       onClick={() => setQrTarget(btn.id as any)}
                       className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${qrTarget === btn.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-200'}`}
                   >
                       <btn.icon size={10} /> {btn.label}
                   </button>
               ))}
           </div>
       </div>

       <div className="p-6 md:p-10 bg-stone-50 min-h-[600px] flex justify-center items-start">
           
           {/* FLYER TAB */}
           {activeTab === 'flyer' && (
               <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                       <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                           <div className="flex justify-between items-center mb-6">
                               <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-stone-400">Campaign Copy</h4>
                               <button onClick={handleGenerateCopy} disabled={isGeneratingCopy} className="text-xs text-orange-600 font-black">
                                   {isGeneratingCopy ? <Loader2 size={14} className="animate-spin" /> : 'Regenerate'}
                               </button>
                           </div>
                           <div className="space-y-6">
                               <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                   <label className="text-[9px] font-bold text-stone-400 uppercase">Headline</label>
                                   <p className="text-xl font-serif font-bold text-stone-900 leading-tight mt-1">{data.flyerCopy?.headline}</p>
                               </div>
                               <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                   <label className="text-[9px] font-bold text-stone-400 uppercase">Hook</label>
                                   <p className="text-sm text-stone-600 leading-relaxed mt-1">{data.flyerCopy?.hook}</p>
                               </div>
                           </div>
                       </div>
                       
                       <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2"><StickyNote size={16}/> Avery™ 53224 Template</h4>
                            <p className="text-xs text-blue-700/70 mb-4">Print at home on 8.5" x 11" Paper.</p>
                            <button onClick={handleDownloadFlyer} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                                <Download size={16} /> Download Print-Ready PDF
                            </button>
                       </div>

                       <button onClick={() => handleOrderPrint('250 Glossy Flyers', '$95')} className="w-full py-4 bg-white text-stone-900 border-2 border-stone-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-3 group">
                           <Printer size={16} className="text-stone-400 group-hover:text-orange-500 transition-colors" /> Professional Print & Ship ($95)
                       </button>
                   </div>

                   {/* Visual Flyer Preview */}
                   <div className="relative">
                        <div className="bg-white shadow-2xl border border-stone-200 aspect-[1/1.29] rounded-sm p-8 relative overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-500 origin-top">
                            <div className="h-24 -mx-8 -mt-8 mb-8 relative overflow-hidden">
                                <div className="absolute inset-0" style={{backgroundColor: data.colorPalette.primary}}></div>
                            </div>
                            <div className="flex-1 flex flex-col items-center text-center space-y-6 relative z-10">
                                {logoUrl && <img src={logoUrl} className="h-16 object-contain" />}
                                <h2 className="text-3xl font-serif font-black text-stone-900">{input.companyName}</h2>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold leading-tight" style={{color: data.colorPalette.primary}}>{data.flyerCopy?.headline}</h3>
                                    <p className="text-xs text-stone-500 leading-relaxed px-4">{data.flyerCopy?.hook}</p>
                                </div>
                                <div className="mt-auto py-4 px-8 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 w-full flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1">Book Today</p>
                                        <p className="text-sm font-bold text-stone-900">{phone}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl border border-stone-100 shadow-sm">
                                        <img src={getQrUrl()} alt="QR" className="w-12 h-12 mix-blend-multiply" />
                                    </div>
                                </div>
                            </div>
                        </div>
                   </div>
               </div>
           )}

           {/* STICKER TAB */}
           {activeTab === 'sticker' && (
               <div className="w-full max-w-5xl">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                       <div>
                           <h3 className="text-2xl font-serif font-black text-stone-900">Sticker Studio</h3>
                           <p className="text-stone-500 mt-2 text-sm">Design custom labels compatible with <strong>Avery™ 22807</strong>.</p>
                       </div>
                       <div className="flex bg-white rounded-xl p-1 shadow-sm border border-stone-200">
                           <button onClick={() => setViewMode('single')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'single' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400'}`}>
                               <Maximize size={14} /> Single
                           </button>
                           <button onClick={() => setViewMode('sheet')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'sheet' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400'}`}>
                               <Grid size={14} /> Sheet
                           </button>
                       </div>
                   </div>
                   
                   <div className="grid lg:grid-cols-3 gap-10">
                       <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                                <Edit3 size={12} /> Sticker Text
                                            </label>
                                            <button 
                                                onClick={handleGenerateStickerText} 
                                                disabled={isGeneratingStickerText}
                                                className="text-[10px] text-orange-600 font-black uppercase flex items-center gap-1.5 hover:bg-orange-50 px-2 py-1 rounded-full transition-all"
                                            >
                                                {isGeneratingStickerText ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                                                Suggest
                                            </button>
                                        </div>
                                        <input type="text" value={stickerText} onChange={(e) => setStickerText(e.target.value)} className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 font-bold text-sm" />
                                        
                                        {stickerSuggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {stickerSuggestions.map((s, i) => (
                                                    <button key={i} onClick={() => setStickerText(s)} className="text-[8px] font-black uppercase tracking-widest bg-stone-100 hover:bg-stone-900 hover:text-white px-2 py-1 rounded-full transition-all">{s}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                            <Layout size={12} /> Shape Selection
                                        </label>
                                        <div className="flex gap-2">
                                            {['round', 'square', 'diecut'].map((s) => (
                                                <button key={s} onClick={() => setStickerStyle(s as any)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${stickerStyle === s ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Color Picker for Round/Square */}
                                    {stickerStyle !== 'diecut' && (
                                        <div className="space-y-3 animate-fade-in-up">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                                <Palette size={12} /> Background Color
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="color" 
                                                    value={stickerBgColor}
                                                    onChange={(e) => setStickerBgColor(e.target.value)}
                                                    className="h-10 w-10 rounded-full cursor-pointer border-none overflow-hidden p-0"
                                                />
                                                <span className="text-xs font-mono font-bold text-stone-600 uppercase">{stickerBgColor}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                            <Paintbrush size={12} /> Premium Finish
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['matte', 'glossy', 'holographic'] as StickerFinish[]).map((f) => (
                                                <button key={f} onClick={() => setStickerFinish(f)} className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${stickerFinish === f ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}>
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <button onClick={() => handleOrderPrint('100 Custom Stickers', '$85')} className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transform hover:-translate-y-1 transition-all">
                                    <ShoppingCart size={18} className="text-orange-500" /> Order Professional Pack ($85)
                                </button>
                                <button onClick={handleDownloadSticker} className="w-full py-4 bg-white text-stone-900 border-2 border-stone-200 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-md hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-3">
                                    <Download size={16} /> Download Sticker PDF
                                </button>
                            </div>
                       </div>

                       <div className="lg:col-span-2 bg-stone-200 rounded-[3rem] border border-stone-300 relative overflow-hidden min-h-[550px] flex items-center justify-center p-8 group">
                            {/* Visual backdrop */}
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
                            
                            {viewMode === 'single' ? (
                                <div className="scale-[1.3] transition-transform duration-700 animate-fade-in-up">
                                    {renderStickerContent()}
                                </div>
                            ) : (
                                <div className="bg-white p-12 shadow-2xl rounded-sm w-full max-w-[500px] aspect-[8.5/11] relative grid grid-cols-3 grid-rows-4 gap-6 animate-fade-in-up scale-[0.9]">
                                    <div className="absolute -top-10 left-0 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Avery™ 22807 Print Sheet Preview</div>
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-center">
                                            <div className="w-full h-full opacity-80 hover:opacity-100 transition-opacity">
                                                {renderStickerContent(true)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="absolute bottom-6 right-8 text-[8px] font-black uppercase tracking-[0.5em] text-stone-400/50 flex items-center gap-2">
                                <ScanLine size={12} /> Photorealistic Studio Preview
                            </div>
                       </div>
                   </div>
               </div>
           )}

           {/* WINDOW STICKER */}
           {activeTab === 'window' && (
                <div className="w-full max-w-4xl flex flex-col items-center">
                    <div className="bg-white p-8 rounded-sm shadow-xl border border-stone-300 w-full max-w-2xl aspect-[3/4] relative">
                         <div className="border-b-4 border-stone-900 pb-4 mb-4 flex justify-between items-end">
                             <div>
                                 <h2 className="text-3xl font-black font-sans uppercase tracking-tight">{input.companyName}</h2>
                                 <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Official Operational Review</p>
                             </div>
                             <div className="text-right">
                                 <div className="text-xs font-bold uppercase text-stone-400">Owner/Operator</div>
                                 <div className="text-xl font-black uppercase">{owner}</div>
                             </div>
                         </div>

                         <div className="grid grid-cols-3 gap-6 h-3/4">
                             <div className="col-span-2 space-y-4 border-r border-stone-200 pr-6">
                                 <div>
                                     <h4 className="font-bold uppercase text-xs border-b border-stone-300 mb-2 pb-1">Included Premium Services</h4>
                                     <ul className="text-xs space-y-1 font-mono">
                                         {input.services.slice(0,8).map((s, i) => (
                                             <li key={i} className="flex justify-between"><span>• {s}</span> <span>INC</span></li>
                                         ))}
                                     </ul>
                                 </div>
                                 <div>
                                     <h4 className="font-bold uppercase text-xs border-b border-stone-300 mb-2 pb-1">Guarantee Info</h4>
                                     <p className="text-[10px] leading-relaxed">
                                         Full satisfaction coverage on all jobs in {input.location}. Managed directly by {owner}.
                                     </p>
                                 </div>
                             </div>
                             
                             <div className="col-span-1 flex flex-col justify-between">
                                 <div className="border-4 border-stone-900 p-2 text-center">
                                     <div className="text-[10px] font-bold uppercase">Rating</div>
                                     <div className="text-4xl font-black my-2">5★</div>
                                     <div className="text-[8px] uppercase">Client Recommended</div>
                                 </div>
                                 
                                 <div className="mt-auto pt-4 flex flex-col items-center">
                                     <div className="p-2 border border-stone-200 rounded-lg shadow-sm mb-2 bg-white">
                                         <img src={getQrUrl()} alt="QR" className="w-24 h-24 mix-blend-multiply" />
                                     </div>
                                     <p className="text-[8px] text-center uppercase font-bold">Scan to {qrTarget === 'booking' ? 'Book Appointment' : qrTarget === 'google' ? 'View Reviews' : 'Visit Website'}</p>
                                 </div>
                             </div>
                         </div>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <button onClick={() => handleOrderPrint('50 Weatherproof Window Labels', '$120')} className="px-10 py-4 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                            <ShoppingCart size={14} /> Order 50 Weatherproof Prints ($120)
                        </button>
                    </div>
                </div>
           )}

            {/* XELA ADVANTAGE TAB */}
            {activeTab === 'xela' && (
                <div className="w-full max-w-4xl space-y-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-lavender/10 text-brand-lavender rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Sparkles size={12} /> The Xela Advantage
                        </div>
                        <h3 className="text-4xl font-serif font-black text-brand-black">Your Legacy, Articulated.</h3>
                        <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
                            We don't just build logos. We build the narrative that connects your passion to your community.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Layout size={80} />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">Brand Story</h4>
                                {data.brandStory ? (
                                    <div className="space-y-6">
                                        <p className="text-lg font-serif italic text-stone-800 leading-relaxed">
                                            "{data.brandStory}"
                                        </p>
                                        <button 
                                            onClick={handleGenerateBrandStory} 
                                            disabled={isGeneratingBrandStory}
                                            className="text-xs font-black text-brand-lavender hover:underline flex items-center gap-2"
                                        >
                                            {isGeneratingBrandStory ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                            Regenerate Story
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300">
                                            <Edit3 size={32} />
                                        </div>
                                        <p className="text-sm text-stone-500">No brand story generated yet.</p>
                                        <button 
                                            onClick={handleGenerateBrandStory} 
                                            disabled={isGeneratingBrandStory}
                                            className="px-8 py-3 bg-brand-black text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-brand-lavender transition-all flex items-center gap-2"
                                        >
                                            {isGeneratingBrandStory ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                            Generate Brand Story
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-brand-black p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 p-6 opacity-10">
                                    <Zap size={100} />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-teal mb-6">Competitive Edge</h4>
                                <ul className="space-y-4">
                                    {[
                                        "Professional-grade visual identity in seconds.",
                                        "Marketing copy optimized for local conversion.",
                                        "Unified brand voice across all touchpoints.",
                                        "Scalable assets ready for print and digital."
                                    ].map((point, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                            <CheckCircle size={18} className="text-brand-teal shrink-0 mt-0.5" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">Social Proof Strategy</h4>
                                <div className="space-y-6">
                                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal">
                                                <MessageCircle size={20} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-brand-black">Review Hook</span>
                                        </div>
                                        <p className="text-sm text-stone-600 italic">
                                            "We're not happy until you're proud of your property. If you loved our work, tell a neighbor. If not, tell us."
                                        </p>
                                    </div>
                                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-brand-lavender/10 rounded-full flex items-center justify-center text-brand-lavender">
                                                <Copy size={20} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-brand-black">Referral Offer</span>
                                        </div>
                                        <p className="text-sm text-stone-600 italic">
                                            "Refer a friend and you both get 10% off your next service. Growing our community, one yard at a time."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gradient-to-br from-brand-lavender to-brand-teal rounded-[2.5rem] text-white shadow-xl">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Launch Checklist</h4>
                                <div className="space-y-3">
                                    {[
                                        "Download your high-res logos",
                                        "Print your first batch of flyers",
                                        "Set up your Google Business profile",
                                        "Post your first brand story on social"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-bold">
                                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                                {i + 1}
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

           {activeTab === 'classifieds' && (
               <div className="w-full max-w-3xl">
                   <div className="text-center mb-8">
                       <h3 className="text-2xl font-serif font-black text-stone-900">Local Ad Generator</h3>
                       <p className="text-stone-500 mt-2">Craigslist & Nextdoor ads optimized for {input.location}.</p>
                   </div>
                   {!classifiedAd ? (
                       <div className="flex flex-col items-center">
                           <button onClick={handleGenerateClassified} disabled={isGeneratingAd} className="px-10 py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3">
                               {isGeneratingAd ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                               Generate Local Ads
                           </button>
                       </div>
                   ) : (
                       <div className="space-y-6">
                           <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-200">
                               <div className="font-bold text-lg text-blue-700">{classifiedAd.title}</div>
                               <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed mt-4">{classifiedAd.body}</div>
                           </div>
                       </div>
                   )}
               </div>
           )}

           {activeTab === 'cards' && (
                <div className="w-full max-w-5xl text-center py-20">
                    <h3 className="text-2xl font-serif font-black text-stone-900 mb-6">Print Sheet Preview</h3>
                    <div className="bg-white w-[300px] h-[400px] shadow-2xl mx-auto rounded-sm border-2 border-dashed border-stone-200 flex items-center justify-center p-4">
                        <div className="grid grid-cols-2 grid-rows-5 gap-1 w-full h-full">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="border border-stone-100 rounded-[2px] overflow-hidden">
                                    {renderBusinessCardContent()}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="mt-10 px-10 py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 mx-auto">
                        <Download size={16} /> Download Sheet (Avery 5371)
                    </button>
                </div>
           )}
       </div>
    </div>
  );
};
