
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
  existingLogo?: string; // Base64 string of uploaded logo
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
}
