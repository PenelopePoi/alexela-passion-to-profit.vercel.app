
import React, { useState, useEffect } from 'react';
import { BrandInput, BrandStrategy, LogoCandidate } from '../types';
const LogoGenerator = React.lazy(() => import('./LogoGenerator').then(m => ({ default: m.LogoGenerator })));
const ColorPaletteDisplay = React.lazy(() => import('./ColorPalette').then(m => ({ default: m.ColorPaletteDisplay })));
const BusinessCard = React.lazy(() => import('./BusinessCard').then(m => ({ default: m.BusinessCard })));
const LandingPagePreview = React.lazy(() => import('./LandingPagePreview').then(m => ({ default: m.LandingPagePreview })));
const SocialProfilePreview = React.lazy(() => import('./SocialProfilePreview').then(m => ({ default: m.SocialProfilePreview })));
const MarketingMaterials = React.lazy(() => import('./MarketingMaterials').then(m => ({ default: m.MarketingMaterials })));
const VideoAdGenerator = React.lazy(() => import('./VideoAdGenerator').then(m => ({ default: m.VideoAdGenerator })));
const VinylStickerGenerator = React.lazy(() => import('./VinylStickerGenerator').then(m => ({ default: m.VinylStickerGenerator })));
const BrandingPackages = React.lazy(() => import('./BrandingPackages').then(m => ({ default: m.BrandingPackages })));
const BusinessManagementStudio = React.lazy(() => import('./BusinessManagementStudio').then(m => ({ default: m.BusinessManagementStudio })));
const Launchpad = React.lazy(() => import('./Launchpad').then(m => ({ default: m.Launchpad })));
const TypographyStudio = React.lazy(() => import('./TypographyStudio').then(m => ({ default: m.TypographyStudio })));
const StudioTutorial = React.lazy(() => import('./StudioTutorial').then(m => ({ default: m.StudioTutorial })));
import { Target, Sparkles, ArrowLeft, RefreshCw, Save, Check, FolderOpen, Loader2, Layers, Film, ShoppingCart, Scissors, Type, Briefcase, Star, Zap, Package, PlayCircle, LogIn, LogOut, User as UserIcon, BrainCircuit, Anchor, FileText, Download, TrendingUp, ZoomIn, Eye, ShieldCheck, BarChart3, DollarSign, Rocket, Bot, Phone, Trophy, Gift, Box, Shield, Fingerprint, Lock, Users, Mic, Video, Brain, Server, Leaf, Scale, Menu, Handshake, Inbox } from 'lucide-react';
import { motion } from 'motion/react';
import { regenerateTaglines, generateFlyerCopy, generateBrandStrategy, generateBrandingPackages, generateAdAssets } from '../services/geminiService';
import { auth, signInWithGoogle, logout, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from '@firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from '@firebase/firestore';
const Chatbot = React.lazy(() => import('./Chatbot').then(m => ({ default: m.Chatbot })));
const AIStudio = React.lazy(() => import('./AIStudio').then(m => ({ default: m.AIStudio })));
const SkillScouter = React.lazy(() => import('./SkillScouter').then(m => ({ default: m.SkillScouter })));
const PortfolioGallery = React.lazy(() => import('./PortfolioGallery').then(m => ({ default: m.PortfolioGallery })));
const BrandAssets = React.lazy(() => import('./BrandAssets').then(m => ({ default: m.BrandAssets })));
const BrandIntelligence = React.lazy(() => import('./BrandIntelligence').then(m => ({ default: m.BrandIntelligence })));
const AssetUpscaler = React.lazy(() => import('./AssetUpscaler').then(m => ({ default: m.AssetUpscaler })));
const AttentionHeatmap = React.lazy(() => import('./AttentionHeatmap').then(m => ({ default: m.AttentionHeatmap })));
import { getClientKey, encryptData, isEncryptionEnabled } from '../services/clientEncryption';
import { hasValidLicense, getDaysRemaining, LICENSE_TIERS, LicenseTier } from '../services/studioLicense';
import LicenseModal from './LicenseModal';
const BrandConsistencyChecker = React.lazy(() => import('./BrandConsistencyChecker').then(m => ({ default: m.BrandConsistencyChecker })));
const UsageAnalytics = React.lazy(() => import('./UsageAnalytics').then(m => ({ default: m.UsageAnalytics })));
const RevenueProjector = React.lazy(() => import('./RevenueProjector').then(m => ({ default: m.RevenueProjector })));
const InvestorReadyDeck = React.lazy(() => import('./InvestorReadyDeck').then(m => ({ default: m.InvestorReadyDeck })));
const BrandFlowStatus = React.lazy(() => import('./BrandFlowStatus'));
const AgentMarketplace = React.lazy(() => import('./AgentMarketplace').then(m => ({ default: m.AgentMarketplace })));
const BrandBotBuilder = React.lazy(() => import('./BrandBotBuilder').then(m => ({ default: m.BrandBotBuilder })));
const BrandEmployee = React.lazy(() => import('./BrandEmployee').then(m => ({ default: m.BrandEmployee })));
const CallCoach = React.lazy(() => import('./CallCoach').then(m => ({ default: m.CallCoach })));
const SpotlightChallenge = React.lazy(() => import('./SpotlightChallenge').then(m => ({ default: m.SpotlightChallenge })));
const GrantProposalGenerator = React.lazy(() => import('./GrantProposalGenerator').then(m => ({ default: m.GrantProposalGenerator })));
const BrandAssetBundle = React.lazy(() => import('./BrandAssetBundle').then(m => ({ default: m.BrandAssetBundle })));
const BrandFormatBridge = React.lazy(() => import('./BrandFormatBridge').then(m => ({ default: m.BrandFormatBridge })));
const AIPowerGrid = React.lazy(() => import('./AIPowerGrid').then(m => ({ default: m.AIPowerGrid })));
const BrandVault = React.lazy(() => import('./BrandVault').then(m => ({ default: m.BrandVault })));
const BrandDNALockbox = React.lazy(() => import('./BrandDNALockbox').then(m => ({ default: m.BrandDNALockbox })));
const DataSovereignty = React.lazy(() => import('./DataSovereignty').then(m => ({ default: m.DataSovereignty })));
const ProvenanceDashboard = React.lazy(() => import('./ProvenanceDashboard').then(m => ({ default: m.ProvenanceDashboard })));
const SimulationVisualizer = React.lazy(() => import('./SimulationVisualizer').then(m => ({ default: m.SimulationVisualizer })));
const GuardianCouncil = React.lazy(() => import('./GuardianCouncil').then(m => ({ default: m.GuardianCouncil })));
import { SentinelBadge } from './SentinelBadge';
const SentinelDashboard = React.lazy(() => import('./SentinelDashboard').then(m => ({ default: m.SentinelDashboard })));
const VoterGeometry = React.lazy(() => import('./VoterGeometry').then(m => ({ default: m.VoterGeometry })));
const BrandVoiceStudio = React.lazy(() => import('./BrandVoiceStudio').then(m => ({ default: m.BrandVoiceStudio })));
const BrandSpokesperson = React.lazy(() => import('./BrandSpokesperson').then(m => ({ default: m.BrandSpokesperson })));
const BrandMemory = React.lazy(() => import('./BrandMemory').then(m => ({ default: m.BrandMemory })));
const MCPClientPortal = React.lazy(() => import('./MCPClientPortal').then(m => ({ default: m.MCPClientPortal })));
const GreenBadge = React.lazy(() => import('./GreenBadge').then(m => ({ default: m.GreenBadge })));
const ContractGenerator = React.lazy(() => import('./ContractGenerator').then(m => ({ default: m.ContractGenerator })));
const ClientCRM = React.lazy(() => import('./ClientCRM').then(m => ({ default: m.ClientCRM })));
const BrotherhoodAlliance = React.lazy(() => import('./BrotherhoodAlliance').then(m => ({ default: m.BrotherhoodAlliance })));
const SubmissionsInbox = React.lazy(() => import('./SubmissionsInbox').then(m => ({ default: m.SubmissionsInbox })));
import { getSubmissionStats } from '../services/submissionLog';
import { createInitialFlowState, FlowNodeId, getTabForNode } from '../services/brandFlowPipeline';
import { ChatMessage } from '../types';

const BG_ANIM_1 = { x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 10, 0] };
const BG_ANIM_2 = { x: [0, -100, 0], y: [0, 50, 0], rotate: [0, -10, 0] };

const SIDEBAR_TABS = [
  { id: 'inbox', label: 'Submissions Inbox', icon: Inbox, color: 'text-brand-teal' },
  { id: 'identity', label: 'Identity Studio', icon: Layers, color: 'text-brand-teal' },
  { id: 'marketing', label: 'Ad Integration', icon: Film, color: 'text-brand-lavender' },
  { id: 'packages', label: 'Elite Packages', icon: Package, color: 'text-brand-teal' },
  { id: 'management', label: 'Business Hub', icon: Briefcase, color: 'text-brand-lavender' },
  { id: 'aistudio', label: 'Xela AI Studio', icon: BrainCircuit, color: 'text-brand-teal' },
  { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit, color: 'text-brand-lavender' },
  { id: 'upscaler', label: 'AI Upscaler', icon: ZoomIn, color: 'text-brand-teal' },
  { id: 'heatmap', label: 'Attention Map', icon: Eye, color: 'text-red-400' },
  { id: 'consistency', label: 'Brand Checker', icon: ShieldCheck, color: 'text-brand-teal' },
  { id: 'analytics', label: 'Usage & PII', icon: BarChart3, color: 'text-blue-500' },
  { id: 'assets', label: 'Brand Assets', icon: FileText, color: 'text-brand-lavender' },
  { id: 'agents', label: 'Agent Market', icon: Sparkles, color: 'text-pink-500' },
  { id: 'botbuilder', label: 'My BrandBot', icon: BrainCircuit, color: 'text-cyan-500' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-green-500' },
  { id: 'investor', label: 'Investor Ready', icon: Rocket, color: 'text-orange-500' },
  { id: 'employee', label: 'AI Employee', icon: Bot, color: 'text-violet-500' },
  { id: 'callcoach', label: 'Call Coach', icon: Phone, color: 'text-emerald-500' },
  { id: 'spotlight', label: 'Spotlight', icon: Trophy, color: 'text-yellow-500' },
  { id: 'grants', label: 'Fund Proposals', icon: Gift, color: 'text-indigo-500' },
  { id: 'assetpacks', label: 'Asset Packs', icon: Box, color: 'text-amber-500' },
  { id: 'bridge', label: 'Format Bridge', icon: Anchor, color: 'text-brand-teal' },
  { id: 'powergrid', label: 'Power Grid', icon: Zap, color: 'text-yellow-400' },
  { id: 'vault', label: 'Brand Vault', icon: Shield, color: 'text-emerald-600' },
  { id: 'dna', label: 'Brand DNA', icon: Fingerprint, color: 'text-violet-600' },
  { id: 'sovereignty', label: 'Data Rights', icon: Lock, color: 'text-red-500' },
  { id: 'provenance', label: 'Provenance', icon: Fingerprint, color: 'text-teal-600' },
  { id: 'simulation', label: 'Sim Stack', icon: Layers, color: 'text-indigo-500' },
  { id: 'council', label: 'AI Council', icon: Users, color: 'text-blue-600' },
  { id: 'sentinel', label: 'Sentinel', icon: Shield, color: 'text-green-600' },
  { id: 'geometry', label: 'Geometry', icon: Eye, color: 'text-fuchsia-500' },
  { id: 'crm', label: 'Client CRM', icon: Users, color: 'text-emerald-500' },
  { id: 'brotherhood', label: 'Brotherhood', icon: Handshake, color: 'text-amber-500' },
  { id: 'voicestudio', label: 'Voice Studio', icon: Mic, color: 'text-pink-500' },
  { id: 'spokesperson', label: 'Spokesperson', icon: Video, color: 'text-cyan-400' },
  { id: 'brandmemory', label: 'Brand Memory', icon: Brain, color: 'text-purple-500' },
  { id: 'mcpportal', label: 'MCP Portal', icon: Server, color: 'text-blue-400' },
  { id: 'greenbadge', label: 'Green Badge', icon: Leaf, color: 'text-green-500' },
  { id: 'contracts', label: 'Contracts', icon: Scale, color: 'text-amber-600' },
  { id: 'portfolio', label: 'Elite Portfolio', icon: Star, color: 'text-brand-lavender' }
] as const;

const TabLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <Loader2 className="animate-spin text-brand-lavender" size={48} />
    <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Loading module...</p>
  </div>
);

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
  onPaymentRequest?: () => void;
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
  saveSuccess,
  onPaymentRequest
}) => {
  const [data, setData] = useState<BrandStrategy>(initialData);
  const [isRegeneratingTaglines, setIsRegeneratingTaglines] = useState(false);
  const [isPromotingSelf, setIsPromotingSelf] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseValid, setLicenseValid] = useState(hasValidLicense());
  const [daysRemaining, setDaysRemaining] = useState(getDaysRemaining());
  const [isGeneratingPackages, setIsGeneratingPackages] = useState(false);
  const [adAssets, setAdAssets] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'marketing' | 'packages' | 'management' | 'aistudio' | 'portfolio' | 'assets' | 'intelligence' | 'upscaler' | 'heatmap' | 'consistency' | 'analytics' | 'revenue' | 'investor' | 'agents' | 'botbuilder' | 'employee' | 'callcoach' | 'spotlight' | 'grants' | 'assetpacks' | 'bridge' | 'powergrid' | 'vault' | 'dna' | 'sovereignty' | 'provenance' | 'simulation' | 'council' | 'sentinel' | 'geometry' | 'voicestudio' | 'spokesperson' | 'brandmemory' | 'mcpportal' | 'greenbadge' | 'contracts' | 'crm' | 'brotherhood' | 'inbox'>('identity');
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flowState, setFlowState] = useState(createInitialFlowState());
  const [isFlowRunning, setIsFlowRunning] = useState(false);
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
    const updateLeadCount = () => {
      try {
        setNewLeadsCount(getSubmissionStats().new || 0);
      } catch (e) {
        setNewLeadsCount(0);
      }
    };
    updateLeadCount();
    const interval = setInterval(updateLeadCount, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

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
    
    const projectId = crypto.randomUUID();
    const projectRef = doc(db, 'projects', projectId);
    
    try {
      let projectData: any = {
        uid: user.uid,
        input,
        strategy: data,
        logoCandidates,
        activeTemplate,
        encrypted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Encrypt if enabled — Firebase only sees ciphertext
      if (isEncryptionEnabled()) {
        const key = await getClientKey(false);
        if (key) {
          projectData = {
            uid: user.uid,
            encryptedPayload: await encryptData({ input, strategy: data, logoCandidates, activeTemplate }, key),
            encrypted: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
        }
      }

      await setDoc(projectRef, projectData);
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
    const selectedLogo_ = logoCandidates.find(c => c.status === 'liked') || (logoCandidates.length > 0 ? logoCandidates[0] : undefined);
    const exportData = {
      input,
      strategy: data,
      logoCandidates,
      logoImageUrl: selectedLogo_?.imageUrl || null,
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

  const handleDownloadBrandKit = () => {
    const selectedLogo_ = logoCandidates.find(c => c.status === 'liked') || (logoCandidates.length > 0 ? logoCandidates[0] : undefined);
    const colors = data.colorPalette;
    const fonts = data.typographyRecommendation;
    const lines = [
      `====================================`,
      `  ${input.companyName} — Brand Kit`,
      `  Generated by XELA Creative Branding Studio`,
      `  ${new Date().toLocaleDateString()}`,
      `====================================`,
      ``,
      `--- BRAND IDENTITY ---`,
      `Company: ${input.companyName}`,
      `Owner: ${input.ownerName || 'N/A'}`,
      `Industry: ${input.industry || 'N/A'}`,
      `Taglines: ${data.taglines?.join(' | ') || 'N/A'}`,
      `Mission: ${data.missionStatement || 'N/A'}`,
      `Vision: ${data.visionStatement || 'N/A'}`,
      `Brand Voice: ${data.brandVoice || 'N/A'}`,
      ``,
      `--- COLOR PALETTE ---`,
      `Primary: ${colors?.primary || 'N/A'}`,
      `Secondary: ${colors?.secondary || 'N/A'}`,
      `Accent: ${colors?.accent || 'N/A'}`,
      `Background: ${colors?.background || 'N/A'}`,
      `Reasoning: ${colors?.explanation || 'N/A'}`,
      ``,
      `--- TYPOGRAPHY ---`,
      `Heading Font: ${fonts?.headingFont || 'N/A'}`,
      `Body Font: ${fonts?.bodyFont || 'N/A'}`,
      `Reasoning: ${fonts?.reasoning || 'N/A'}`,
      ``,
      `--- LOGO ---`,
      selectedLogo_?.imageUrl ? `Logo URL: ${selectedLogo_.imageUrl}` : 'No logo generated yet',
      ``,
      `--- MARKETING COPY ---`,
      `Flyer Headline: ${data.flyerCopy?.headline || 'N/A'}`,
      `Flyer Hook: ${data.flyerCopy?.hook || 'N/A'}`,
      `Flyer CTA: ${data.flyerCopy?.callToAction || 'N/A'}`,
      ``,
      `--- SOCIAL MEDIA IDEAS ---`,
      ...(data.socialMediaPostIdeas || []).map((p, i) => `${i + 1}. [${p.platform}] ${p.caption}`),
      ``,
      `--- CONTACT ---`,
      `Phone: ${input.phone || 'N/A'}`,
      `Email: ${input.email || 'N/A'}`,
      `Website: ${input.website || 'N/A'}`,
      ``,
      `© XELA Creative Branding Studio — xelabrandingstudio@gmail.com — (321) 375-9685`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-brand-kit.txt`;
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
    if (!hasValidLicense()) {
      setShowLicenseModal(true);
      return;
    }
    setIsPromotingSelf(true);
    const selfInput: BrandInput = {
        companyName: "XELA Creative Branding Studio",
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
    <div className="flex flex-col min-h-screen pb-20 pt-24 overflow-visible mesh-gradient relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={BG_ANIM_1}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-brand-lavender/5 rounded-full blur-[100px]"
        />
        <motion.div
          animate={BG_ANIM_2}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-brand-teal/5 rounded-full blur-[100px]"
        />
      </div>

      <header className="sticky top-0 z-40 glass border-b border-stone-200/50 shadow-sm bg-white/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
             <button
               onClick={onReset}
               aria-label="Home"
               className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
             >
               <img
                 src="/xela-logo-new.png"
                 alt="XELA Creative Branding Studio"
                 className="h-10 md:h-12 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform"
               />
             </button>
             <div className="w-px h-8 bg-stone-300 hidden md:block" />
             <button onClick={onReset} aria-label="Go back" className="p-3 bg-stone-100/50 hover:bg-brand-lavender hover:text-white rounded-full transition-all text-stone-600 border border-white/50">
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
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-stone-100/50 rounded-full border border-white/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Xela AI Core Active</span>
              </div>
              <SentinelBadge onClick={() => setActiveTab('sentinel')} />
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-brand-lavender overflow-hidden shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="User" className="w-full h-full object-cover" />
                </div>
                <button onClick={handleLogout} aria-label="Log out" className="p-3 bg-stone-100/50 hover:bg-red-500 hover:text-white rounded-xl transition-all text-stone-600 border border-white/50">
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
        {/* BrandFlow Status Bar */}
        <React.Suspense fallback={<TabLoader />}>
        <BrandFlowStatus
          flowState={flowState}
          onToggleAutoFlow={() => setFlowState(prev => ({ ...prev, isAutoFlowEnabled: !prev.isAutoFlowEnabled }))}
          onRunFullPackage={async () => {
            setIsFlowRunning(true);
            try {
              await handleRegenerate();
              const updatedNodes = { ...flowState.nodes };
              Object.keys(updatedNodes).forEach(key => {
                updatedNodes[key as FlowNodeId] = { ...updatedNodes[key as FlowNodeId], status: 'done' };
              });
              setFlowState(prev => ({ ...prev, nodes: updatedNodes, lastRunAt: Date.now() }));
            } catch (e) {
              console.error(e);
            } finally {
              setIsFlowRunning(false);
            }
          }}
          onNodeClick={(nodeId) => {
            const tab = getTabForNode(nodeId);
            if (tab) setActiveTab(tab as any);
          }}
          isRunning={isFlowRunning}
        />
        </React.Suspense>

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
              {isPromotingSelf ? (
                <Loader2 size={18} className="animate-spin" />
              ) : licenseValid ? (
                <BrainCircuit size={18} />
              ) : (
                <span className="text-base">🔒</span>
              )}
              {licenseValid ? 'Clone This Studio' : `Unlock Cloning — from $${LICENSE_TIERS.starter.price}`}
            </button>
            {licenseValid && daysRemaining !== null && daysRemaining !== Infinity && daysRemaining < 7 && (
              <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase tracking-wider">
                License expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 mb-20">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mb-4 p-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            <Menu size={18} /> {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
          </button>
          {/* Sidebar Navigation */}
          <aside className={`lg:w-72 space-y-4 shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="glass-dark rounded-[2.5rem] p-4 space-y-2">
              {SIDEBAR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group ${activeTab === tab.id ? 'bg-white text-brand-black shadow-xl scale-[1.02]' : 'text-stone-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? tab.color : 'group-hover:text-white transition-colors'} />
                  {tab.label}
                  {tab.id === 'inbox' && newLeadsCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[9px] font-black">
                      {newLeadsCount}
                    </span>
                  )}
                  {activeTab === tab.id && tab.id !== 'inbox' && <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 bg-brand-teal rounded-full" />}
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
            {activeTab === 'inbox' && (
              <React.Suspense fallback={<TabLoader />}>
                <SubmissionsInbox />
              </React.Suspense>
            )}
            {activeTab === 'identity' && (
          <React.Suspense fallback={<TabLoader />}>
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
          </React.Suspense>
        )}

        {activeTab === 'marketing' && (
          <React.Suspense fallback={<TabLoader />}>
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
          </React.Suspense>
        )}

        {activeTab === 'packages' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isGeneratingPackages ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-brand-lavender" size={48} />
                <p className="text-stone-500 font-black uppercase tracking-widest text-xs">Engineering Elite Packages...</p>
              </div>
            ) : (
              <BrandingPackages data={data} input={input} adAssets={adAssets} onPaymentRequest={onPaymentRequest} />
            )}
          </div>
          </React.Suspense>
        )}

        {activeTab === 'management' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BusinessManagementStudio />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'aistudio' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AIStudio />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'portfolio' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PortfolioGallery />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'upscaler' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AssetUpscaler input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'heatmap' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AttentionHeatmap input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'consistency' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandConsistencyChecker input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'analytics' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <UsageAnalytics input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'assets' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandAssets
              input={input}
              strategy={data}
              onUpdateStrategy={handleUpdateStrategy}
            />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'intelligence' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandIntelligence
              input={input}
              strategy={data}
              onUpdateStrategy={handleUpdateStrategy}
            />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'agents' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AgentMarketplace input={input} strategy={data} onUpdateStrategy={handleUpdateStrategy} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'botbuilder' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandBotBuilder input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'revenue' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <RevenueProjector input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'investor' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InvestorReadyDeck input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'employee' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandEmployee input={input} strategy={data} onUpdateStrategy={handleUpdateStrategy} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'callcoach' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CallCoach input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'spotlight' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SpotlightChallenge input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'grants' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GrantProposalGenerator input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'assetpacks' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandAssetBundle input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'bridge' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandFormatBridge input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'powergrid' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AIPowerGrid input={input} strategy={data} onUpdateStrategy={handleUpdateStrategy} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'vault' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandVault input={input} strategy={data} logoCandidates={logoCandidates} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'dna' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandDNALockbox input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'sovereignty' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DataSovereignty input={input} strategy={data} logoCandidates={logoCandidates} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'provenance' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ProvenanceDashboard input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'simulation' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SimulationVisualizer input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'council' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GuardianCouncil input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'sentinel' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SentinelDashboard input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'geometry' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <VoterGeometry input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'crm' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ClientCRM input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'brotherhood' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrotherhoodAlliance input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'voicestudio' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandVoiceStudio input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'spokesperson' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandSpokesperson input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'brandmemory' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BrandMemory input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'mcpportal' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MCPClientPortal input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'greenbadge' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GreenBadge input={input} strategy={data} />
          </div>
          </React.Suspense>
        )}

        {activeTab === 'contracts' && (
          <React.Suspense fallback={<TabLoader />}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ContractGenerator input={input} strategy={data} />
          </div>
          </React.Suspense>
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
            aria-label="Export brand package as JSON"
          >
            <Download size={18} className="text-orange-500" /> Export JSON
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <button
            onClick={handleDownloadBrandKit}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
            aria-label="Download brand kit as text file"
          >
            <Download size={18} className="text-brand-teal" /> Brand Kit
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <React.Suspense fallback={<Loader2 size={18} className="animate-spin text-brand-lavender" />}>
          <Launchpad
            input={input}
            strategy={data}
          />
          </React.Suspense>
        </div>
      </div>

      <React.Suspense fallback={null}>
        <Chatbot brandInput={input} strategy={data} />
      </React.Suspense>
      <React.Suspense fallback={null}>
        <SkillScouter />
      </React.Suspense>
      
      {showTutorial && (
        <React.Suspense fallback={<TabLoader />}>
        <StudioTutorial
          onClose={() => setShowTutorial(false)}
          onTabChange={setActiveTab}
        />
        </React.Suspense>
      )}

      <LicenseModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        onPurchase={(tier: LicenseTier) => {
          setLicenseValid(true);
          setDaysRemaining(getDaysRemaining());
          // Auto-proceed with clone after successful purchase
          setTimeout(() => handlePromoteSelf(), 100);
        }}
      />
    </div>
  );
};
