
import React, { useState, useEffect } from 'react';
import { BrandStrategy, BrandInput } from '../types';
import { Laptop, Smartphone, CheckCircle, Menu, ArrowRight, Globe, Play, Loader2, Video, Save, FolderOpen, Send, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface LandingPageProps {
  data: BrandStrategy;
  input: BrandInput;
  logoUrl?: string;
  activeTemplate: string;
  setActiveTemplate: (t: string) => void;
  onSaveTemplate: () => void;
  onLoadTemplate: () => void;
  hasSavedData: boolean;
}

const TEMPLATES = ['Modern Growth', 'Heritage Trust', 'Eco Guardian'];

const LOADING_MESSAGES = [
  "Visualizing your brand environment...",
  "Rendering cinematic frames...",
  "Applying lighting and textures...",
  "Consulting the creative muse...",
  "Almost there! Polishing the final render...",
  "Optimizing for high definition...",
];

export const LandingPagePreview: React.FC<LandingPageProps> = ({ 
  data, 
  input, 
  logoUrl, 
  activeTemplate, 
  setActiveTemplate,
  onSaveTemplate,
  onLoadTemplate,
  hasSavedData
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const { primary, secondary, accent, background } = data.colorPalette;
  const headingFont = data.typographyRecommendation.headingFont;
  const bodyFont = data.typographyRecommendation.bodyFont;

  useEffect(() => {
    let interval: number;
    if (isGeneratingVideo) {
      interval = window.setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGeneratingVideo]);

  const handleGenerateVideo = async () => {
    if (isGeneratingVideo) return;
    setIsGeneratingVideo(true);
    setShowPromptInput(false);
    
    try {
        if ((window as any).aistudio) {
             const hasKey = await (window as any).aistudio.hasSelectedApiKey();
             if (!hasKey) {
                 await (window as any).aistudio.openSelectKey();
             }
        }

        // Create a new instance right before call as per guidelines
        const apiKey = process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        
        const finalPrompt = userPrompt 
          ? `${userPrompt}. Cinematic, high quality, ${input.vibe} aesthetic, dominated by ${primary} tones.`
          : `Cinematic drone shot of a ${input.industry} environment for ${input.companyName}, ${input.vibe} aesthetic, color palette dominated by ${primary}`;

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: finalPrompt,
            config: { 
                numberOfVideos: 1, 
                resolution: '1080p', 
                aspectRatio: '16:9' 
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) {
             // Append the API key to the x-goog-api-key header as per guidelines
             const videoRes = await fetch(uri, {
                 method: 'GET',
                 headers: {
                     'x-goog-api-key': apiKey,
                 },
             });
             const blob = await videoRes.blob();
             setVideoUrl(URL.createObjectURL(blob));
        }
    } catch (e: any) {
        console.error("Video generation failed", e);
        // Reset key selection if entity not found (usually billing/project mismatch)
        if (e?.message?.includes("Requested entity was not found")) {
            if ((window as any).aistudio) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        alert("Video generation failed. Please ensure you have a valid paid API key and try again.");
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const renderLoadingOverlay = () => (
      <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center text-white p-6 text-center">
          <div className="flex flex-col items-center gap-6 bg-white/5 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl max-w-sm animate-fade-in-up">
              <div className="relative">
                  <Loader2 size={64} className="animate-spin text-orange-500 opacity-20" />
                  <Video size={32} className="absolute inset-0 m-auto text-orange-500 animate-pulse" />
              </div>
              <div className="space-y-3">
                  <p className="font-serif text-2xl font-black italic tracking-tight">{LOADING_MESSAGES[loadingMessageIndex]}</p>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.4em]">Powered by Google Veo 3.1</p>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 animate-[loading_10s_ease-in-out_infinite]"></div>
              </div>
          </div>
      </div>
  );

  const renderTemplateContent = () => {
    switch (activeTemplate) {
      case 'Modern Growth':
        return (
          <div className={`h-full overflow-y-auto bg-white font-sans text-stone-800 scrollbar-thin relative`} style={{ fontFamily: bodyFont }}>
            {isGeneratingVideo && renderLoadingOverlay()}
            <nav className="flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur sticky top-0 z-20 border-b border-stone-100">
                 <div className="flex items-center gap-2">
                    {logoUrl && (
                      <motion.img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-8 w-8 object-contain cursor-pointer" 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      />
                    )}
                    <span className="font-bold text-lg tracking-tight" style={{ fontFamily: headingFont, color: primary }}>{input.companyName}</span>
                 </div>
                 <div className="hidden sm:flex gap-6 text-sm font-medium text-stone-600">
                    <span>Services</span><span>About</span><span>Projects</span>
                 </div>
                 <button className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: primary }}>
                    Contact Us
                 </button>
            </nav>

            <div className="relative h-80 sm:h-[500px] flex items-center justify-center text-center px-8 overflow-hidden">
               <div className="absolute inset-0 z-0 bg-stone-900">
                  {videoUrl ? (
                      <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
                  ) : (
                      <>
                        {logoUrl ? (
                            <div className="w-full h-full relative">
                                <img src={logoUrl} alt="" className="w-full h-full object-cover opacity-10 blur-xl scale-110" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <img src={logoUrl} alt="" className="w-32 h-32 object-contain" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-stone-800 opacity-60 flex items-center justify-center">
                                <span className="text-white/20 text-4xl font-bold uppercase">{input.industry}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </>
                  )}
               </div>
               
               <div className="relative z-10 text-white max-w-2xl mx-auto flex flex-col items-center">
                  <h1 className="text-4xl sm:text-6xl font-black mb-6 drop-shadow-2xl font-serif italic" style={{ fontFamily: headingFont }}>{data.taglines[0]}</h1>
                  <p className="mb-10 text-lg opacity-90 font-medium max-w-lg mx-auto leading-relaxed drop-shadow-lg">{data.missionStatement.split('.')[0]}.</p>
                  
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex gap-4">
                        <button className="px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: primary, color: 'white' }}>
                            Start Your Project
                        </button>
                        {!videoUrl && !showPromptInput && (
                            <button 
                                onClick={() => setShowPromptInput(true)} 
                                className="bg-white/20 backdrop-blur-xl border border-white/40 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-2 shadow-2xl hover:scale-110 active:scale-95"
                            >
                                <Sparkles size={16} /> Design Background
                            </button>
                        )}
                    </div>

                    {showPromptInput && (
                        <div className="mt-4 w-full max-w-md animate-fade-in-up">
                            <div className="glass p-4 rounded-[2rem] flex flex-col gap-3 shadow-2xl border border-white/20 backdrop-blur-2xl">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Dream Scenario</span>
                                    <button onClick={() => setShowPromptInput(false)} className="text-white/50 hover:text-white"><X size={14}/></button>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="e.g. Golden hour aerial view of a forest..."
                                        className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-white/30"
                                        value={userPrompt}
                                        onChange={(e) => setUserPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateVideo()}
                                    />
                                    <button 
                                        onClick={handleGenerateVideo}
                                        className="bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-white/40 italic px-2">AI will interpret your prompt to create a custom background cinematic.</p>
                            </div>
                        </div>
                    )}
                  </div>
               </div>
            </div>

            <div className="p-16 bg-stone-50">
                <div className="text-center mb-16">
                    <span className="text-[11px] font-black tracking-[0.5em] uppercase" style={{ color: secondary }}>Global Standards</span>
                    <h3 className="text-4xl font-black mt-4 font-serif" style={{ color: primary, fontFamily: headingFont }}>World-Class {input.industry}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {input.services.slice(0, 4).map((service, i) => (
                        <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100 group hover:-translate-y-2 transition-all">
                            <div className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: i % 2 === 0 ? primary : accent }}>
                                <CheckCircle size={28} />
                            </div>
                            <h4 className="font-black text-xl text-stone-900 font-serif italic mb-2">{service}</h4>
                            <p className="text-sm text-stone-400">Premium execution of {service.toLowerCase()} tailored to your needs.</p>
                        </div>
                    ))}
                </div>

                {/* Signature Portfolio Section */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black font-serif" style={{ color: primary, fontFamily: headingFont }}>Signature Portfolio</h3>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primary }}></div>
                            <div className="w-3 h-3 rounded-full opacity-30" style={{ backgroundColor: primary }}></div>
                            <div className="w-3 h-3 rounded-full opacity-10" style={{ backgroundColor: primary }}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg border border-stone-200 group relative">
                                <img 
                                    src={`input_file_${i}.png`} 
                                    alt={`Work ${i}`} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">View Project</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        );

      case 'Heritage Trust':
        return (
          <div className={`h-full overflow-y-auto bg-[#faf9f6] text-stone-800 scrollbar-thin relative`} style={{ fontFamily: bodyFont }}>
             {isGeneratingVideo && renderLoadingOverlay()}
             <div className="bg-white px-6 py-4 border-b-4 border-double border-stone-200 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {logoUrl && (
                      <motion.img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-10 w-10 object-contain p-1 border border-stone-200 rounded-full cursor-pointer" 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      />
                    )}
                    <span className="font-bold text-xl tracking-wide uppercase" style={{ fontFamily: headingFont, color: '#1c1917' }}>{input.companyName}</span>
                </div>
                <Menu size={24} className="text-stone-400" />
             </div>

             <div className="relative p-20 text-center border-b border-stone-200 bg-white overflow-hidden group min-h-[500px] flex items-center justify-center">
                {videoUrl ? (
                    <div className="absolute inset-0 z-0">
                         <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                ) : (
                    logoUrl && (
                        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover blur-3xl scale-150" />
                            <img src={logoUrl} alt="" className="absolute w-64 h-64 object-contain opacity-20" />
                        </div>
                    )
                )}

                <div className="relative z-10 max-w-3xl">
                    <div className="w-24 h-1 mx-auto mb-10" style={{ backgroundColor: primary }}></div>
                    <h1 className="text-4xl sm:text-6xl font-bold mb-10 leading-tight max-w-2xl mx-auto" style={{ fontFamily: headingFont, color: videoUrl ? 'white' : secondary }}>
                        {data.taglines[1]}
                    </h1>
                    <p className={`mb-12 italic text-2xl font-serif px-10 ${videoUrl ? 'text-stone-200' : 'text-stone-500'}`}>"{data.visionStatement}"</p>
                    
                    {!videoUrl && !showPromptInput && (
                         <button 
                            onClick={() => setShowPromptInput(true)} 
                            className="inline-flex items-center gap-3 border-4 px-10 py-4 uppercase tracking-[0.3em] text-sm font-black hover:bg-stone-900 hover:text-white transition-all shadow-xl" 
                            style={{ borderColor: primary, color: primary }}
                         >
                            <Sparkles size={18} /> Direct Cinematic Design
                         </button>
                    )}

                    {showPromptInput && (
                        <div className="mt-8 w-full max-w-md mx-auto animate-fade-in-up">
                            <div className="bg-white p-6 shadow-2xl border-4 border-stone-900 flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-stone-900">Art Direction</span>
                                    <button onClick={() => setShowPromptInput(false)} className="text-stone-400 hover:text-stone-900"><X size={18}/></button>
                                </div>
                                <div className="flex gap-3">
                                    <input 
                                        type="text"
                                        placeholder="e.g. A high-end boutique storefront at sunset..."
                                        className="flex-1 border-2 border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                                        value={userPrompt}
                                        onChange={(e) => setUserPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateVideo()}
                                    />
                                    <button 
                                        onClick={handleGenerateVideo}
                                        className="bg-stone-900 text-white px-6 py-3 font-black uppercase tracking-widest text-xs shadow-lg hover:bg-stone-800"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             </div>

             <div className="grid grid-cols-2">
                 <div className="p-16 bg-stone-100 flex items-center justify-center border-r border-stone-200">
                    <div className="text-center">
                        <h3 className="text-6xl font-black mb-4 font-serif" style={{ color: primary }}>Top</h3>
                        <p className="text-xs uppercase tracking-[0.5em] font-black text-stone-400">Industry Leader</p>
                    </div>
                 </div>
                 <div className="p-16 bg-stone-900 text-white flex items-center justify-center">
                    <div className="text-center">
                        <h3 className="text-6xl font-black mb-4 font-serif" style={{ color: secondary }}>100%</h3>
                        <p className="text-xs uppercase tracking-[0.5em] font-black text-stone-500">Service Guarantee</p>
                    </div>
                 </div>
             </div>
          </div>
        );

      case 'Eco Guardian':
        return (
          <div className={`h-full overflow-y-auto bg-stone-50 scrollbar-thin relative`} style={{ fontFamily: bodyFont }}>
            {isGeneratingVideo && renderLoadingOverlay()}
            <div className="absolute top-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-2xl rounded-full px-8 py-4 flex justify-between items-center shadow-2xl border border-white/50">
                 <div className="flex items-center gap-3">
                    {logoUrl && (
                      <motion.img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-8 w-8 object-contain cursor-pointer" 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      />
                    )}
                    <span className="font-black text-lg tracking-tight font-serif italic" style={{ color: primary }}>{input.companyName}</span>
                 </div>
                 <span className="text-[10px] font-black px-4 py-2 rounded-full border shadow-inner uppercase tracking-widest" style={{ color: secondary, backgroundColor: secondary + '10', borderColor: secondary + '30' }}>Planet-First</span>
            </div>

            <div className="m-4 mt-24 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl min-h-[450px] flex flex-col justify-end" style={{ backgroundColor: primary }}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-[100px] transform translate-x-32 -translate-y-32"></div>
                
                {videoUrl ? (
                    <div className="absolute inset-0 z-0 opacity-50 mix-blend-overlay">
                         <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    </div>
                ) : (
                    logoUrl && (
                        <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none">
                            <img src={logoUrl} alt="" className="w-full h-full object-cover blur-2xl scale-125" />
                        </div>
                    )
                )}

                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-6xl font-black mb-6 font-serif italic" style={{ fontFamily: headingFont }}>Future Forward.</h1>
                    <p className="text-lg opacity-90 mb-10 max-w-sm font-medium leading-relaxed">{data.taglines[2]}</p>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                            {!videoUrl && !showPromptInput && (
                                <button 
                                    onClick={() => setShowPromptInput(true)} 
                                    className="bg-white/20 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-xl border border-white/30 hover:bg-white/30 transition-all flex items-center gap-3 shadow-2xl"
                                >
                                    <Sparkles size={16} /> Ambient Motion
                                </button>
                            )}
                            <button className="bg-white text-stone-900 px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform" style={{ color: primary }}>
                                Reserve Now
                            </button>
                        </div>

                        {showPromptInput && (
                            <div className="w-full max-w-sm animate-fade-in-up">
                                <div className="bg-white/10 backdrop-blur-3xl p-4 rounded-3xl border border-white/20 flex flex-col gap-3">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Nature's Canvas</span>
                                        <button onClick={() => setShowPromptInput(false)} className="text-white/40 hover:text-white"><X size={14}/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            placeholder="E.g. Lush tropical leaves in slow motion..."
                                            className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none"
                                            value={userPrompt}
                                            onChange={(e) => setUserPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateVideo()}
                                        />
                                        <button 
                                            onClick={handleGenerateVideo}
                                            className="bg-white text-stone-900 p-2.5 rounded-2xl shadow-xl"
                                            style={{ color: primary }}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-12">
                <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.5em] mb-10">Our Ecosystem</h3>
                <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
                    {input.services.map((s, i) => (
                        <div key={i} className="flex-shrink-0 bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100 min-w-[220px] hover:border-green-200 transition-all hover:scale-105">
                            <div className="w-14 h-14 rounded-full mb-8 flex items-center justify-center shadow-inner" style={{ backgroundColor: accent + '20' }}>
                                <CheckCircle size={28} style={{ color: primary }} />
                            </div>
                            <span className="text-xl font-black text-stone-900 block leading-tight font-serif italic">{s}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="glass rounded-[3rem] shadow-2xl border-white/50 overflow-hidden flex flex-col h-[900px] lg:h-[800px] animate-fade-in-up">
      <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center bg-white/60 gap-6">
        <div>
            <h3 className="font-black text-stone-900 flex items-center gap-4 text-xl tracking-tight">
            <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-xl">
                <Laptop size={24} />
            </div>
            Digital Presence Hub
            </h3>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shadow-inner">
                {TEMPLATES.map(t => (
                    <button key={t} onClick={() => setActiveTemplate(t)} className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTemplate === t ? 'bg-stone-900 text-white shadow-xl scale-105' : 'text-stone-400 hover:text-stone-600'}`}>
                        {t}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="flex-1 bg-stone-50 p-6 sm:p-12 flex items-center justify-center overflow-hidden relative">
         {/* Subtle background texture for the preview area */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
         
         <div className={`
            bg-white shadow-[0_50px_100px_rgba(0,0,0,0.15)] transition-all duration-1000 relative flex flex-col overflow-hidden border border-stone-200
            ${viewMode === 'mobile' ? 'w-[360px] h-[720px] rounded-[50px] border-[12px] border-stone-900' : 'w-full h-full max-w-6xl rounded-[2.5rem]'}
         `}>
            {viewMode === 'desktop' && (
                <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between">
                    <div className="flex gap-2 ml-2">
                        <div className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-inner"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400 shadow-inner"></div>
                    </div>
                    <div className="bg-stone-200/50 px-10 py-1.5 rounded-full text-[9px] font-black text-stone-400 tracking-widest uppercase">
                        {`https://${input.companyName.toLowerCase().replace(/\s/g, '-')}.com`}
                    </div>
                    <div className="w-12"></div>
                </div>
            )}
            {renderTemplateContent()}
         </div>
      </div>
    </div>
  );
};
