
import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { PortfolioGallery } from './components/PortfolioGallery';
import { LoadingOverlay } from './components/LoadingOverlay';
import { LiveAssistant } from './components/LiveAssistant';
import { ProjectsModal } from './components/ProjectsModal';
import { Pricing } from './components/Pricing';
import { XelaLogo } from './components/XelaLogo';
import { motion, AnimatePresence } from 'motion/react';
import { BrandInput, BrandStrategy, LogoCandidate, SavedProject } from './types';
import { generateBrandStrategy } from './services/geminiService';
import { FolderOpen, Target, Zap, ArrowDown, TrendingUp, Anchor, CheckCircle, ArrowLeft } from 'lucide-react';

const SAMPLE_PROJECT: { data: BrandStrategy; input: BrandInput } = {
  input: {
    companyName: 'S.L.U.G.S.',
    ownerName: 'Elite Founder',
    businessSuffix: 'LLC',
    industry: 'Tactical Branding & Identity',
    services: ['Elite Identity Design', 'Full Marketing Suites', 'Brand Ecosystems', 'Tactical Consulting'],
    vibe: 'Bold & Energetic',
    location: 'Florida, USA',
    audience: 'High-Impact Entrepreneurs',
    yearsExperience: '15 Years',
    phone: '(555) 999-0123',
    email: 'contact@slugs.elite',
    website: 'www.slugs.elite',
    googleBusinessLink: 'https://maps.google.com/slugs-elite',
    bookingLink: 'https://calendly.com/slugs/consult',
    qrPreference: 'website',
    existingLogo: 'input_file_0.png'
  },
  data: {
    taglines: ['Soldiers Living Under Gods Supervision.', 'Tactical Branding for Elite Legacies.', 'Mission-Critical Identity.', 'Command Your Market.', 'The Standard for Excellence.'],
    missionStatement: 'To engineer high-impact brand identities that command respect and drive conversion for elite entrepreneurs.',
    visionStatement: 'To be the global standard for tactical brand engineering and strategic identity development.',
    brandVoice: 'Bold, Authoritative, Precise, Elite.',
    colorPalette: {
      primary: '#111111',
      secondary: '#FF4D00',
      accent: '#00FFCC',
      background: '#FFFFFF',
      explanation: 'Deep black provides a tactical foundation, while high-visibility orange and neon teal accents create a bold, energetic, and high-tech aesthetic.'
    },
    typographyRecommendation: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      reasoning: 'Playfair Display offers a classic, artisanal feel for headings, while Inter provides clean, modern readability for body text and digital interfaces.'
    },
    socialMediaPostIdeas: [
      { platform: 'Instagram', caption: 'The first crack. ☕️ Watch the transformation of our Ethiopian Yirgacheffe. #CoffeeRoasting #VelvetBean', visualIdea: 'Slow-motion video of beans in the roaster.' },
      { platform: 'Facebook', caption: 'New batch alert! Our limited edition Honey Processed Costa Rican is now available for wholesale. 🍯🇨🇷', visualIdea: 'Close-up photo of roasted beans in a bag.' },
      { platform: 'LinkedIn', caption: 'Sustainability isn\'t just a buzzword for us. It\'s how we do business. Proud to support our farming partners. 🤝', visualIdea: 'Photo of Elena at a coffee farm.' },
      { platform: 'TikTok', caption: 'How to brew the perfect V60 at home. ⏱️💧 #BaristaTips #HomeBrewing', visualIdea: 'Fast-paced tutorial video.' }
    ],
    flyerCopy: {
      headline: "Experience Coffee Like Never Before.",
      hook: "Small-batch roasted in the heart of Portland. Ethically sourced, expertly crafted.",
      callToAction: "Visit us at www.velvetbean.coffee for a Free Tasting"
    },
    classifiedAdCopy: {
      title: "☕️ Premium Coffee Roastery - Wholesale & Retail - Fresh Daily!",
      body: "Velvet Bean LLC offers specialty roasted coffee beans and barista training. Direct trade sourcing and artisanal roasting. 12 years experience. Call Elena at (503) 555-0123."
    }
  }
};

const App: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'intake' | 'dashboard'>('landing');
  const [selectedPackage, setSelectedPackage] = useState<'budget' | 'premium' | 'elite' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brandData, setBrandData] = useState<BrandStrategy | null>(null);
  const [inputData, setInputData] = useState<BrandInput | null>(null);
  const [logoCandidates, setLogoCandidates] = useState<LogoCandidate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState('Modern Growth');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('brand_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  const handleSelectPackage = (tier: 'budget' | 'premium' | 'elite') => {
    setSelectedPackage(tier);
    setInputData(null); // Clear previous input on new start
    setStep('intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setStep('landing');
    setSelectedPackage(null);
  };

  const handleLoadSample = () => {
    setInputData(SAMPLE_PROJECT.input);
    setBrandData(SAMPLE_PROJECT.data);
    setLogoCandidates([]);
    setStep('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (data: BrandInput) => {
    setIsLoading(true);
    try {
      const inputWithTier = { ...data, selectedTier: selectedPackage || undefined };
      const strategy = await generateBrandStrategy(inputWithTier);
      setBrandData(strategy);
      setInputData(inputWithTier);
      setLogoCandidates([]);
      setStep('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate brand strategy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (data: BrandStrategy, input: BrandInput, logos: LogoCandidate[], template: string) => {
    setIsSaving(true);
    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: input.companyName || "Untitled Project",
      lastModified: Date.now(),
      data,
      input,
      logos,
      template,
      status: 'completed'
    };

    const updatedProjects = [newProject, ...projects.filter(p => p.name !== input.companyName)];
    setProjects(updatedProjects);
    localStorage.setItem('brand_projects', JSON.stringify(updatedProjects));
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveDraft = (input: BrandInput) => {
    const draftName = input.companyName || "Untitled Draft";
    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: draftName,
      lastModified: Date.now(),
      input,
      logos: [],
      template: 'Modern Growth',
      status: 'draft'
    };

    const updatedProjects = [newProject, ...projects.filter(p => p.id !== newProject.id && p.name !== draftName)];
    setProjects(updatedProjects);
    localStorage.setItem('brand_projects', JSON.stringify(updatedProjects));
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('brand_projects', JSON.stringify(updated));
  };

  const handleLoadProject = (project: SavedProject) => {
    if (project.status === 'draft' || !project.data) {
      setInputData(project.input);
      setStep('intake');
    } else {
      setBrandData(project.data);
      setInputData(project.input);
      setLogoCandidates(project.logos || []);
      setActiveTemplate(project.template || 'Modern Growth');
      setStep('dashboard');
    }
    setIsProjectsModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setStep('landing');
    setBrandData(null);
    setInputData(null);
    setLogoCandidates([]);
    setSelectedPackage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      {isLoading && <LoadingOverlay />}
      
      {step === 'landing' && (
        <div className="flex flex-col w-full animate-fade-in-up">
          {/* Landing Header */}
          <header className="absolute top-0 left-0 right-0 z-50 px-8 py-8 flex justify-between items-center max-w-[1600px] mx-auto w-full">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={handleReset}>
              <div className="w-12 h-12 bg-brand-black rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <span className="text-white font-serif font-black text-2xl">X</span>
              </div>
              <div className="flex flex-col">
                <span className="text-brand-black font-serif font-black text-xl tracking-tighter uppercase leading-none">Xela</span>
                <span className="text-[8px] font-black tracking-[0.3em] text-stone-400 uppercase">Elite Studio</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsProjectsModalOpen(true)}
                className="hidden md:block text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-brand-black transition-colors"
              >
                Archive ({projects.length})
              </button>
              <button 
                onClick={scrollToPricing}
                className="px-8 py-3 bg-brand-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl"
              >
                Launch Now
              </button>
            </div>
          </header>

          {/* Hero Section - Editorial Style */}
          <div className="relative min-h-screen flex flex-col justify-center px-8 overflow-hidden bg-brand-paper">
             <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="space-y-12"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-black/5 rounded-full border border-brand-black/10">
                        <Target size={14} className="text-brand-teal" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-black">The "I Quit" Accelerator</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-[12vw] lg:text-[10vw] font-serif font-black tracking-tighter text-brand-black leading-[0.82] uppercase">
                          Passion<br/>
                          <span className="text-brand-teal italic">Profit.</span>
                        </h1>
                        <div className="flex items-center gap-6 pt-4">
                          <div className="h-[1px] w-20 bg-brand-black/20"></div>
                          <p className="text-lg md:text-xl text-stone-500 max-w-md font-medium leading-tight">
                            Xela is your elite AI consultant. We build high-conversion legacies for the modern Florida entrepreneur.
                          </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-8">
                       <button 
                          onClick={scrollToPricing}
                          className="group px-12 py-6 bg-brand-black text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center gap-4"
                       >
                          Start Your Legacy <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform text-brand-teal" />
                       </button>
                       <button 
                          onClick={handleLoadSample}
                          className="px-12 py-6 bg-white text-brand-black border border-stone-200 rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:border-brand-teal transition-all hover:scale-105 active:scale-95"
                       >
                          View Case Study
                       </button>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="relative hidden lg:block"
                >
                  <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden oval-mask shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1000" 
                      alt="Elite Studio" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand-teal/10 mix-blend-overlay"></div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-lavender/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-brand-teal/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  
                  <div className="absolute top-1/4 -right-20 vertical-text text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
                    Precision Engineered • Florida Market
                  </div>
                </motion.div>
             </div>
             
             {/* Background Text */}
             <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] select-none">
                <span className="text-[30vw] font-serif font-black whitespace-nowrap leading-none uppercase -mb-10 block">Xela Studio</span>
             </div>
          </div>

          {/* Portfolio Section */}
          <section id="portfolio" className="bg-white py-24">
            <PortfolioGallery />
          </section>

          {/* Value Prop Section */}
          <div className="bg-white py-32 border-y border-stone-100">
             <div className="max-w-[1600px] mx-auto px-8">
                <div className="grid lg:grid-cols-2 gap-20 items-end mb-24">
                   <div className="space-y-6">
                      <h2 className="text-5xl md:text-7xl font-serif font-black text-brand-black leading-[0.9] uppercase">Why Smart Founders Choose <span className="text-brand-lavender">Xela.</span></h2>
                      <p className="text-xl text-stone-500 max-w-xl font-medium">We've automated the expensive parts of starting a business so you can focus on making money.</p>
                   </div>
                   <div className="flex justify-end">
                      <div className="text-right">
                        <span className="text-7xl font-serif font-black text-brand-teal">98%</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Conversion Increase</p>
                      </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-3 gap-12 mb-32">
                   <div className="space-y-8">
                      <div className="w-12 h-12 bg-brand-black text-white rounded-full flex items-center justify-center font-serif italic text-xl">01</div>
                      <h3 className="text-2xl font-black font-serif text-brand-black uppercase tracking-tight">Instant Speed</h3>
                      <p className="text-stone-500 text-sm leading-relaxed font-medium">
                         Agencies take 4-6 weeks to deliver a logo. Xela builds your entire brand identity, strategy, and assets in <span className="text-brand-black font-bold">under 60 seconds</span>.
                      </p>
                   </div>
                   <div className="space-y-8">
                      <div className="w-12 h-12 bg-brand-black text-white rounded-full flex items-center justify-center font-serif italic text-xl">02</div>
                      <h3 className="text-2xl font-black font-serif text-brand-black uppercase tracking-tight">Elite Quality</h3>
                      <p className="text-stone-500 text-sm leading-relaxed font-medium">
                         Powered by Gemini 3.1 and Veo, our AI generates professional-grade logos, copy, and video ads that rival <span className="text-brand-black font-bold">$5,000+ agency work</span>.
                      </p>
                   </div>
                   <div className="space-y-8">
                      <div className="w-12 h-12 bg-brand-black text-white rounded-full flex items-center justify-center font-serif italic text-xl">03</div>
                      <h3 className="text-2xl font-black font-serif text-brand-black uppercase tracking-tight">Market Dominance</h3>
                      <p className="text-stone-500 text-sm leading-relaxed font-medium">
                         Save over <span className="text-brand-black font-bold">$4,500</span> on startup costs. No retainer fees, no hourly billing—just one flat, affordable rate for everything.
                      </p>
                   </div>
                </div>

                {/* Comparison Table - Minimalist */}
                <div className="bg-brand-black rounded-[4rem] p-12 md:p-24 text-white shadow-2xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none"></div>
                   <div className="relative z-10 max-w-4xl mx-auto">
                      <h3 className="text-4xl font-serif font-black text-center mb-16 uppercase tracking-tight">The Xela Advantage</h3>
                      <div className="space-y-8">
                        {[
                          { label: "Brand Identity", agency: "$2,500+", xela: "Included" },
                          { label: "Marketing Strategy", agency: "$1,500+", xela: "Included" },
                          { label: "Video Ad Production", agency: "$1,000+", xela: "Included" },
                          { label: "Turnaround Time", agency: "4-6 Weeks", xela: "Instantly", highlight: true }
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between py-6 border-b border-white/10 group hover:bg-white/5 transition-colors px-4 rounded-xl">
                            <span className="text-lg font-serif italic text-stone-400">{row.label}</span>
                            <div className="flex items-center gap-12">
                              <span className="text-sm text-stone-600 line-through">{row.agency}</span>
                              <span className={`text-lg font-black uppercase tracking-widest ${row.highlight ? 'text-brand-teal' : 'text-white'}`}>{row.xela}</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-12">
                          <span className="text-3xl font-serif font-black uppercase">Total Cost</span>
                          <div className="text-right">
                            <span className="block text-stone-600 line-through text-lg">$5,000+</span>
                            <span className="text-5xl font-black text-brand-teal">$149 - $399</span>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing">
            <Pricing onSelectPackage={handleSelectPackage} />
          </div>

          {/* Legal Footer */}
          <footer className="bg-brand-black text-stone-400 py-24 px-8 mt-auto">
             <div className="max-w-[1600px] mx-auto grid md:grid-cols-4 gap-16 text-xs leading-relaxed">
                <div className="col-span-2 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-brand-black font-serif font-black text-xl">X</span>
                      </div>
                      <h4 className="text-white font-serif font-black text-2xl uppercase tracking-tight">Xela Elite Studio</h4>
                   </div>
                   <p className="max-w-sm">Empowering the independent spirit of Florida entrepreneurs through precision-engineered AI branding.</p>
                   <p>&copy; {new Date().getFullYear()} Xela Inc. All rights reserved.</p>
                </div>
                <div>
                   <h5 className="text-white font-bold uppercase tracking-widest mb-4">Legal Disclaimer</h5>
                   <p className="mb-2">
                      Xela is a branding automation tool, not a law firm. Information regarding LLC filing, business licenses, and insurance is for educational purposes only.
                   </p>
                   <p>
                      Consult with a qualified attorney or tax professional for advice specific to your business situation.
                   </p>
                </div>
                <div>
                   <h5 className="text-white font-bold uppercase tracking-widest mb-4">Support</h5>
                   <ul className="space-y-2">
                      <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Pricing Tiers</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                   </ul>
                </div>
             </div>
          </footer>
        </div>
      )}

      {step === 'intake' && (
        <div className="flex flex-col w-full min-h-screen bg-stone-50 animate-fade-in-up">
           <div className="py-8 px-6 border-b border-stone-200 bg-white sticky top-0 z-30 flex justify-between items-center shadow-sm">
              <button onClick={handleBackToLanding} className="flex items-center gap-2 text-stone-500 hover:text-brand-black font-bold text-sm">
                 <ArrowLeft size={16} /> Back to Packages
              </button>
              <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Consultant: Xela</div>
                  <div className="text-xl font-serif font-black text-brand-teal capitalize italic">
                      {selectedPackage === 'basic' ? 'The Seedling' : 'The Sovereign'} Package
                  </div>
              </div>
           </div>
           
           <div className="py-12 px-4 max-w-4xl mx-auto w-full">
              <div className="mb-8 text-center">
                  <h2 className="text-3xl font-serif font-black text-brand-black mb-2">Design Brief Intake</h2>
                  <p className="text-stone-500">Tell us about your business so we can build your assets.</p>
              </div>
              <InputForm 
                 initialData={inputData}
                 onSubmit={handleSubmit} 
                 onSaveDraft={handleSaveDraft}
                 isLoading={isLoading} 
                 submitLabel="Generate Brand Strategy & Enter Studio" 
              />
           </div>
        </div>
      )}

      {step === 'dashboard' && brandData && inputData && (
          <Dashboard 
            data={brandData} 
            input={inputData} 
            logoCandidates={logoCandidates}
            setLogoCandidates={setLogoCandidates}
            activeTemplate={activeTemplate}
            setActiveTemplate={setActiveTemplate}
            onSave={handleSave}
            onReset={handleReset}
            onOpenProjects={() => setIsProjectsModalOpen(true)}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
          />
      )}

      <ProjectsModal 
        isOpen={isProjectsModalOpen} 
        onClose={() => setIsProjectsModalOpen(false)} 
        projects={projects}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />

      <LiveAssistant />
    </div>
  );
};

export default App;
