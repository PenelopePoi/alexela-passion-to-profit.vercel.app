
export interface BrandInput {
  companyName: string;
  ownerName?: string;
  businessSuffix?: string; // e.g., "LLC", "Inc"
  industry: string; // e.g., "Bakery", "Tech Startup", "Tree Service"
  services: string[];
  vibe: string; // e.g., "Modern", "Rustic", "Industrial"
  location: string;
  audience: string;
  additionalNotes?: string;
  existingLogo?: string; // Base64 string of uploaded logo (primary/first)
  existingLogos?: string[]; // Multiple logo references/ideas
  logoDescription?: string; // What they want if they have ideas but no final logo
  logoStatus?: 'have' | 'iterate' | 'none'; // Whether they have a logo, want to iterate, or need one created
  existingMotto?: string; // User's existing slogan if they have one
  existingTagline?: string; // User's existing catchphrase
  existingMission?: string;
  existingVision?: string;
  existingVoice?: string;
  
  // Contact & Links
  yearsExperience?: string;
  phone?: string;
  email?: string;
  website?: string;
  bookingLink?: string;
  googleBusinessLink?: string;
  qrPreference?: 'website' | 'google' | 'booking' | 'contact';
  selectedTier?: 'budget' | 'premium' | 'elite';
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  explanation: string;
}

export interface BrandingPackage {
  id: string;
  name: string;
  tier: 'Budget' | 'Premium' | 'Elite';
  price: string;
  description: string;
  deliverables: string[];
  productionScope: string;
  timeline: string;
  pricingLogic: string;
  targetProfile: string;
  legitimacyChecklist: string[];
  budgetBreakdown: {
    startup: string;
    production: string;
    marketing: string;
    scaling: string;
  };
  terms: {
    scope: string;
    revisions: string;
    payment: string;
    refund: string;
    ip: string;
  };
}

export interface ContentCalendarDay {
  day: number;
  topic: string;
  platform: string;
  caption: string;
  visualIdea: string;
}

export interface EmailTemplate {
  type: string;
  subject: string;
  body: string;
}

export interface BrandGuidelines {
  logoUsage: string;
  colorUsage: string;
  typographyUsage: string;
  voiceAndTone: string;
  imageryStyle: string;
}

export interface CompetitorAnalysis {
  competitorName: string;
  url: string;
  strengths: string[];
  weaknesses: string[];
  differentiation: string;
}

export interface BrandVoiceAnalysis {
  tone: string;
  style: string;
  keywords: string[];
  samplePhrases: string[];
}

export interface BrandStrategy {
  taglines: string[];
  missionStatement: string;
  visionStatement: string;
  brandVoice: string;
  colorPalette: ColorPalette;
  typographyRecommendation: {
    headingFont: string;
    bodyFont: string;
    reasoning: string;
  };
  socialMediaPostIdeas: Array<{
    platform: string;
    caption: string;
    visualIdea: string;
  }>;
  flyerCopy?: {
    headline: string;
    hook: string;
    callToAction: string;
  };
  brandStory?: string;
  classifiedAdCopy?: {
    title: string;
    body: string;
  };
  packages?: BrandingPackage[];
  contentCalendar?: ContentCalendarDay[];
  emailTemplates?: EmailTemplate[];
  brandGuidelines?: BrandGuidelines;
  competitorAnalyses?: CompetitorAnalysis[];
  voiceAnalysis?: BrandVoiceAnalysis;
}

export interface GeneratedLogo {
  imageUrl: string;
  promptUsed: string;
}

export interface LogoCandidate {
  id: string;
  imageUrl: string;
  status: 'liked' | 'disliked' | 'neutral';
  description?: string;
}

export interface GeneratedAsset {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  preview?: string;
  prompt: string;
  timestamp: number;
  model?: string;
}

export interface SavedProject {
  id: string;
  uid?: string;
  name: string;
  lastModified: number;
  data?: BrandStrategy;
  input: BrandInput;
  logos: LogoCandidate[];
  template: string;
  status: 'draft' | 'completed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  toolResults?: Array<{
    toolName: string;
    displayType: string;
    data: any;
    summary: string;
  }>;
}

// --- News-to-Feature Types (April 2026) ---

export interface VideoTierConfig {
  tier: 'lite' | 'standard' | '4k';
  resolution: '720p' | '1080p' | '4K';
  model: string;
  costPerSecond: number;
  maxDuration: number;
  nativeAudio: boolean;
}

export interface BrandVoiceProfile {
  id: string;
  name: string;
  sampleAudioUrl?: string;
  clonedVoiceId?: string;
  greetingScript?: string;
  adScript?: string;
  podcastIntro?: string;
  generatedAudios: Array<{
    type: 'greeting' | 'ad' | 'podcast' | 'custom';
    audioUrl: string;
    script: string;
    timestamp: number;
  }>;
}

export interface SpokespersonConfig {
  id: string;
  personaName: string;
  style: 'professional' | 'friendly' | 'energetic' | 'luxury';
  avatarDescription: string;
  scriptTone: string;
  generatedVideos: Array<{
    videoUrl: string;
    script: string;
    musicStyle: string;
    timestamp: number;
  }>;
}

export interface BrandMemoryEntry {
  id: string;
  type: 'conversation' | 'asset' | 'guideline' | 'competitor' | 'feedback';
  content: string;
  timestamp: number;
  source: string;
}

export interface ContractTemplate {
  id: string;
  type: 'branding' | 'nda' | 'license' | 'retainer' | 'custom';
  title: string;
  parties: { provider: string; client: string };
  sections: Array<{ heading: string; body: string }>;
  packageRef?: string;
  generatedAt: number;
}

export interface GreenScoreData {
  totalApiCalls: number;
  estimatedKWh: number;
  carbonOffsetKg: number;
  efficiencyRating: 'A' | 'B' | 'C' | 'D';
  badgeEligible: boolean;
  breakdown: Array<{ service: string; calls: number; energy: number }>;
}

export interface MCPToolExport {
  toolName: string;
  description: string;
  inputSchema: Record<string, any>;
  endpoint: string;
}

export interface DeployableAgent {
  id: string;
  name: string;
  type: 'chat' | 'faq' | 'recommender' | 'booking';
  brandContext: string;
  embedCode: string;
  deployedAt?: number;
  status: 'draft' | 'deployed' | 'paused';
}
