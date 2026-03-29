
import React, { useState, useEffect } from 'react';
import { BrandInput, BrandStrategy, LogoCandidate } from '../types';
import { LogoGenerator } from './LogoGenerator';
import { ColorPaletteDisplay } from './ColorPalette';
import { BusinessCard } from './BusinessCard';
import { LandingPagePreview } from './LandingPagePreview';
import { SocialProfilePreview } from './SocialProfilePreview';
import { MarketingMaterials } from './MarketingMaterials';
import { VideoAdGenerator } from './VideoAdGenerator';
import { VinylStickerGenerator } from './VinylStickerGenerator';
import { BrandingPackages } from './BrandingPackages';
import { BusinessManagementStudio } from './BusinessManagementStudio';
import { Launchpad } from './Launchpad';
import { TypographyStudio } from './TypographyStudio';
import { StudioTutorial } from './StudioTutorial';
import { Target, Sparkles, ArrowLeft, RefreshCw, Save, Check, FolderOpen, Loader2, Layers, Film, ShoppingCart, Scissors, Type, Briefcase, Star, Zap, Package, PlayCircle, LogIn, LogOut, User as UserIcon, BrainCircuit, Anchor, FileText, Download, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { regenerateTaglines, generateFlyerCopy, generateBrandStrategy, generateBrandingPackages, generateAdAssets } from '../services/geminiService';
import { auth, signInWithGoogle, logout, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Chatbot } from './Chatbot';
import { AIStudio } from './AIStudio';
import { PortfolioGallery } from './PortfolioGallery';
import { BrandAssets } from './BrandAssets';
import { BrandIntelligence } from './BrandIntelligence';
import { ChatMessage } from '../types';

interface DashboardProps {
  data: BrandStrategy;
  input: BrandInput;
  logoCandidates: LogoCandidate[];
  setLogoCandidates: React.Dispatch<React.SetStateAction<LogoCandidate[]>>;
  activeTemplate: string;
  setActiveTemplate: (t: string) => void;
  onSave: (data: BrandStrategy, input: BrandInput, logos: LogoCandidate[], template: string) => void;
  onReset: () => void;
  onOpenProjects: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  data: initialData, 
  input, 
  logoCandidates, 
  setLogoCandidates, 
  activeTemplate,
  setActiveTemplate,
  onSave, 
  onReset,
  onOpenProjects,
  isSaving,
  saveSuccess
}) => {
  const [data, setData] = useState<BrandStrategy>(initialData);
  const [isRegeneratingTaglines, setIsRegeneratingTaglines] = useState(false);
  const [isPromotingSelf, setIsPromotingSelf] = useState(false);
  const [isGeneratingPackages, setIsGeneratingPackages] = useState(false);
  const [adAssets, setAdAssets] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'marketing' | 'packages' | 'management' | 'aistudio' | 'portfolio' | 'assets' | 'intelligence'>('identity');
  const [showTutorial, setShowTutorial] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!data.flyerCopy) {
        generateFlyerCopy(input, data).then(copy => {
            setData(prev => ({...prev, flyerCopy: copy}));
        }).catch(console.error);
    }
    
    if (!data.packages && !isGeneratingPackages) {
      handleGenerateElitePackages();
    }
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      handleLogin();
      return;
    }
    
    const projectId = `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const projectRef = doc(db, 'projects', projectId);
    
    try {
      await setDoc(projectRef, {
        uid: user.uid,
        input,
        strategy: data,
        logoCandidates,
        activeTemplate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      onSave(data, input, logoCandidates, activeTemplate);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `projects/${projectId}`);
    }
  };

  const handleGenerateElitePackages = async () => {
    setIsGeneratingPackages(true);
    try {
      const [packages, ads] = await Promise.all([
        generateBrandingPackages(input),
        generateAdAssets(input, data)
      ]);
      setData(prev => ({ ...prev, packages }));
      setAdAssets(ads);
    } catch (e) {
      console.error("Elite package generation failed", e);
    } finally {
      setIsGeneratingPackages(false);
    }
  };

  const selectedLogo = logoCandidates.find(c => c.status === 'liked') || (logoCandidates.length > 0 ? logoCandidates[0] : undefined);
  const brandingLogo = input.existingLogo || selectedLogo?.imageUrl;

  const handleSaveProject = () => {
    onSave(data, input, logoCandidates, activeTemplate);
  };

  const handleExport = () => {
    const exportData = {
      input,
      strategy: data,
      logoCandidates,
      activeTemplate,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-brand-package.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = async () => {
    setIsRegeneratingTaglines(true);
    try {
      const strategy = await generateBrandStrategy(input);
      setData(strategy);
      handleGenerateElitePackages();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingTaglines(false);
    }
  };

  const handleRegenerateTaglines = async () => {
    setIsRegeneratingTaglines(true);
    try {
      const newTaglines = await regenerateTaglines(input);
      setData(prev => ({ ...prev, taglines: newTaglines }));
    } catch (e) {
      console.error("Failed to regenerate taglines", e);
    } finally {
      setIsRegeneratingTaglines(false);
    }
  };

  const handleColorChange = (key: keyof typeof data.colorPalette, value: string) => {
    setData(prev => ({
        ...prev,
        colorPalette: { ...prev.colorPalette, [key]: value }
    }));
  };

  const handleUpdateTypography = (updated: Partial<BrandStrategy['typographyRecommendation']>) => {
    setData(prev => ({
        ...prev,
        typographyRecommendation: { ...prev.typographyRecommendation, ...updated }
    }));
  };

  const handleUpdateStrategy = (updated: Partial<BrandStrategy>) => {
      setData(prev => ({ ...prev, ...updated }));
  };

  const handlePromoteSelf = async () => {
    setIsPromotingSelf(true);
    const selfInput: BrandInput = {
        companyName: "Xela Elite AI Creative Studio",
        industry: "Elite Branding & Business Development",
        services: ["AI Strategy", "Logo Engineering", "Business Registration", "Marketing Automation", "E-commerce Ecosystems"],
        vibe: "Elite, Artistic, High-Conversion, Professional",
        location: "Florida & Nationwide",
        audience: "Sole Proprietors & Entrepreneurs",
        additionalNotes: "Using Cricut Explorer 3, HP precision printing, and advanced Gemini AI models."
    };
    try {
        const strategy = await generateBrandStrategy(selfInput);
        onSave(strategy, selfInput, [], 'modern');
        window.location.reload(); // Simple way to reset with new data
    } catch (e) {
        console.error(e);
    } finally {
        setIsPromotingSelf(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 overflow-visible mesh-gradient relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-brand-lavender/5 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, 50, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-brand-teal/5 rounded-full blur-[100px]"
        />
      </div>

      <header className="sticky top-0 z-40 glass border-b border-stone-200/50 shadow-sm bg-white/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <button onClick={onReset} className="p-3 bg-stone-100/50 hover:bg-brand-lavender hover:text-white rounded-full transition-all text-stone-600 border border-white/50">
                <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-black rounded-2xl flex items-center justify-center p-2 border border-stone-800 overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
                    {brandingLogo ? (
                        <img src={brandingLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-full h-full bg-brand-lavender text-white flex items-center justify-center font-black text-xl">
                            {input.companyName.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="font-serif text-2xl font-black text-brand-black uppercase tracking-tight italic">{input.companyName}</h1>
                    <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase flex items-center gap-2">
                      <Sparkles size={10} className="text-brand-teal" /> Operational Dashboard
                    </p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-stone-100/50 rounded-full border border-white/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Xela AI Core Active</span>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-brand-lavender overflow-hidden shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="User" className="w-full h-full object-cover" />
                </div>
                <button onClick={handleLogout} className="p-3 bg-stone-100/50 hover:bg-red-500 hover:text-white rounded-xl transition-all text-stone-600 border border-white/50">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-6 py-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all shadow-xl disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                Sync Project
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 relative z-10">
        {/* Self-Promotion Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-1 bg-gradient-to-r from-brand-lavender via-brand-teal to-brand-lavender rounded-[2.5rem] shadow-2xl"
        >
          <div className="bg-brand-black rounded-[2.25rem] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lavender/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="flex-1 space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lavender/20 text-brand-lavender rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={12} /> Elite Consultant Recommendation
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-white leading-tight">
                Want to build an <span className="text-brand-teal italic">Elite Studio</span> like this?
              </h2>
              <p className="text-stone-400 text-lg font-medium max-w-xl">
                Xela can engineer your own AI-powered branding agency. From custom models to automated fulfillment.
              </p>
            </div>
            <button 
              onClick={handlePromoteSelf}
              disabled={isPromotingSelf}
              className="px-10 py-5 bg-white text-brand-black rounded-2xl font-black uppercase tracking-widest hover:bg-brand-lavender hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-3 relative z-10"
            >
              {isPromotingSelf ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
              Clone This Studio
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 mb-20">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 space-y-4 shrink-0">
            <div className="glass-dark rounded-[2.5rem] p-4 space-y-2">
              {[
                { id: 'identity', label: 'Identity Studio', icon: Layers, color: 'text-brand-teal' },
                { id: 'marketing', label: 'Ad Integration', icon: Film, color: 'text-brand-lavender' },
                { id: 'packages', label: 'Elite Packages', icon: Package, color: 'text-brand-teal' },
                { id: 'management', label: 'Business Hub', icon: Briefcase, color: 'text-brand-lavender' },
                { id: 'aistudio', label: 'Xela AI Studio', icon: BrainCircuit, color: 'text-brand-teal' },
                { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit, color: 'text-brand-lavender' },
                { id: 'assets', label: 'Brand Assets', icon: FileText, color: 'text-brand-lavender' },
                { id: 'portfolio', label: 'Elite Portfolio', icon: Star, color: 'text-brand-lavender' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group ${activeTab === tab.id ? 'bg-white text-brand-black shadow-xl scale-[1.02]' : 'text-stone-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? tab.color : 'group-hover:text-white transition-colors'} />
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 bg-brand-teal rounded-full" />}
                </button>
              ))}
            </div>

            <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Project Health</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-stone-500">Identity Strength</span>
                    <span className="text-brand-teal">92%</span>
                  </div>
                  <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-brand-teal" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-stone-500">Market Readiness</span>
                    <span className="text-brand-lavender">85%</span>
                  </div>
                  <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-brand-lavender" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <button 
                  onClick={() => setActiveTab('intelligence')}
                  className="w-full py-4 bg-brand-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <TrendingUp size={14} className="text-brand-teal" /> Run Health Check
                </button>
                <button 
                  onClick={() => setShowTutorial(true)}
                  className="w-full py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> Studio Tutorial
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {activeTab === 'identity' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <div className="card-premium relative overflow-hidden bg-white">
                    <div className="flex justify-between items-center mb-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-brand-lavender text-white text-[10px] font-black flex items-center justify-center">1</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">Discovery & Direction</span>
                            </div>
                            <h3 className="text-xl font-black text-brand-black flex items-center gap-3">
                                <Sparkles size={20} className="text-brand-lavender" /> Identity Catchphrases
                            </h3>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest ml-8">Golden Ratio Balanced • Artistic • Simple</p>
                        </div>
                        <button onClick={handleRegenerateTaglines} disabled={isRegeneratingTaglines} className="p-3 rounded-full hover:bg-brand-teal/10 text-stone-400 transition-all">
                            <RefreshCw size={20} className={isRegeneratingTaglines ? "animate-spin" : ""} />
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {data.taglines.map((tag, idx) => (
                            <motion.div 
                              key={idx} 
                              whileHover={{ x: 10 }}
                              className="p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-brand-teal hover:shadow-lg transition-all group cursor-pointer"
                            >
                                 <p className="text-brand-black font-bold font-serif italic text-2xl">"{tag}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-black rounded-[3rem] p-12 text-white border-2 border-brand-black shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lavender/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10 space-y-10">
                        <div>
                            <h3 className="text-[9px] font-black text-brand-lavender uppercase tracking-widest mb-4">Mission Statement</h3>
                            <p className="text-3xl font-serif font-bold italic leading-tight">"{data.missionStatement}"</p>
                        </div>
                        <div>
                            <h3 className="text-[9px] font-black text-brand-teal uppercase tracking-widest mb-4">Vision Statement</h3>
                            <p className="text-stone-300 text-lg leading-relaxed">{data.visionStatement}</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 p-8 opacity-10">
                        <Target size={120} />
                    </div>
                </div>
              </div>

                <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 px-6">
                    <span className="w-6 h-6 rounded-full bg-brand-teal text-white text-[10px] font-black flex items-center justify-center">2</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">Creation Protocol</span>
                </div>
                <LogoGenerator 
                  brandInput={input} 
                  primaryColor={data.colorPalette.primary} 
                  candidates={logoCandidates} 
                  onUpdateCandidates={setLogoCandidates} 
                />
                
                {/* Signature Results Preview */}
                <div className="glass-dark rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Star size={12} className="text-brand-lavender" /> Signature Results
                        </h4>
                        <button onClick={() => setActiveTab('portfolio')} className="text-[8px] text-brand-teal font-black uppercase tracking-widest hover:underline">View Full Gallery</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 group/sig relative bg-stone-900">
                                <img 
                                    src={`input_file_${i}.png`} 
                                    alt="Signature Result" 
                                    className="w-full h-full object-cover grayscale group-hover/sig:grayscale-0 transition-all duration-500" 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = brandingLogo || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=200';
                                        (e.target as HTMLImageElement).className = "w-full h-full object-contain p-4 opacity-20";
                                    }}
                                    referrerPolicy="no-referrer" 
                                />
                                <div className="absolute inset-0 bg-brand-teal/20 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center justify-center">
                                    <Zap size={14} className="text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reference Assets */}
                <div className="glass-dark rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Anchor size={12} className="text-brand-teal" />
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Reference Assets</h4>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div key={i} className="flex-shrink-0 w-24 aspect-[3/4] rounded-xl overflow-hidden border border-white/5 relative group/asset bg-stone-900">
                                <img 
                                    src={`input_file_${i}.png`} 
                                    alt={`Asset ${i}`} 
                                    className="w-full h-full object-cover opacity-60 group-hover/asset:opacity-100 transition-all"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = brandingLogo || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400';
                                        (e.target as HTMLImageElement).className = "w-full h-full object-contain p-8 opacity-10";
                                    }}
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-[6px] font-black text-white/50 uppercase tracking-widest">REF_0{i}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Visual Identity Studio */}
            <div className="space-y-10">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <Layers className="text-brand-lavender" />
                    <h2 className="text-3xl font-serif font-black text-brand-black tracking-tight">Visual Identity Studio</h2>
                  </div>
               </div>
               <div className="grid lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-12 xl:col-span-8">
                     <BusinessCard data={data} input={input} logoUrl={brandingLogo} />
                  </div>
                  <div className="lg:col-span-12 xl:col-span-4 space-y-10">
                     <ColorPaletteDisplay palette={data.colorPalette} onColorChange={handleColorChange} />
                     <TypographyStudio data={data} onUpdateTypography={handleUpdateTypography} />
                  </div>
               </div>
            </div>

            <VinylStickerGenerator 
              logoUrl={brandingLogo} 
              companyName={input.companyName} 
              primaryColor={data.colorPalette.primary} 
            />
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 px-2">
                <Film className="text-brand-lavender" />
                <h2 className="text-3xl font-serif font-black text-brand-black tracking-tight">AI-Powered Ad Assets</h2>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 flex flex-col gap-10">
                <SocialProfilePreview data={data} input={input} logoUrl={brandingLogo} />
                <MarketingMaterials data={data} input={input} logoUrl={brandingLogo} onUpdateStrategy={handleUpdateStrategy} />
              </div>
              <div className="lg:col-span-2">
                <VideoAdGenerator data={data} input={input} primaryColor={data.colorPalette.primary} />
              </div>
            </div>

            <LandingPagePreview 
              data={data} 
              input={input} 
              logoUrl={brandingLogo} 
              activeTemplate={activeTemplate} 
              setActiveTemplate={setActiveTemplate}
              onSaveTemplate={handleSaveProject}
              onLoadTemplate={onOpenProjects}
              hasSavedData={true}
            />
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isGeneratingPackages ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-brand-lavender" size={48} />
                <p className="text-stone-500 font-black uppercase tracking-widest text-xs">Engineering Elite Packages...</p>
              </div>
            ) : (
              <BrandingPackages data={data} input={input} adAssets={adAssets} />
            )}
          </div>
        )}

        {activeTab === 'management' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BusinessManagementStudio />
          </div>
        )}

        {activeTab === 'aistudio' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AIStudio />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PortfolioGallery />
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandAssets 
              input={input} 
              strategy={data} 
              onUpdateStrategy={handleUpdateStrategy} 
            />
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandIntelligence 
              input={input} 
              strategy={data} 
              onUpdateStrategy={handleUpdateStrategy} 
            />
          </div>
        )}
          </div>
        </div>

        {/* Finalize Purchase Section */}
        <div className="bg-gradient-to-br from-brand-black to-stone-900 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
           <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-brand-teal/5">
                 <Check className="text-brand-teal" size={40} />
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight">Ready to Launch Your Legacy?</h2>
              <p className="text-xl text-stone-400 leading-relaxed">
                You've refined your brand, perfected your logo, and visualized your physical assets. It's time to take the final step.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                 <button 
                   onClick={handleSaveProject}
                   className="px-12 py-6 bg-brand-teal text-white rounded-[2rem] text-lg font-black shadow-2xl hover:scale-110 transition-all flex items-center gap-3 group"
                 >
                    Finalize & Complete Purchase <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
                 </button>
                 <button 
                   onClick={onReset}
                   className="px-12 py-6 bg-white/10 text-white border border-white/20 rounded-[2rem] text-lg font-black hover:bg-white/20 transition-all"
                 >
                    Start Over
                 </button>
              </div>
              <p className="text-stone-500 text-xs uppercase tracking-[0.3em] pt-8">Secure Checkout • Instant Asset Delivery • Lifetime Access</p>
           </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-dark px-8 py-4 rounded-full flex items-center gap-6 shadow-2xl border border-white/20">
          <button 
            onClick={onOpenProjects}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <FolderOpen size={18} className="text-brand-teal" /> My Projects
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <button 
            onClick={handleSaveToCloud}
            disabled={isSaving}
            className="flex items-center gap-2 text-white hover:text-brand-teal transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <Check size={18} className="text-green-500" /> : <Save size={18} className="text-brand-lavender" />}
            {saveSuccess ? 'Saved' : 'Save Project'}
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <Download size={18} className="text-orange-500" /> Export JSON
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <Launchpad 
            input={input}
            strategy={data}
          />
        </div>
      </div>

      <Chatbot />
      
      {showTutorial && (
        <StudioTutorial 
          onClose={() => setShowTutorial(false)} 
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
};
