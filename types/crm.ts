/**
 * CRM Types — XELA Creative Branding Studio
 * Client management, deal pipeline, communications, and activity tracking.
 * All monetary amounts in cents. All dates in Unix ms.
 */

export enum ClientStatus {
  LEAD = 'lead',
  PROSPECT = 'prospect',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CHURNED = 'churned',
  VIP = 'vip',
}

export enum DealStage {
  INQUIRY = 'inquiry',
  CONSULTATION = 'consultation',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum ActivityType {
  NOTE = 'note',
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  PAYMENT = 'payment',
  DELIVERY = 'delivery',
  FOLLOW_UP = 'follow_up',
  CONTRACT = 'contract',
}

export enum CommunicationChannel {
  EMAIL = 'email',
  PHONE = 'phone',
  TEXT = 'text',
  IN_PERSON = 'in_person',
  SOCIAL = 'social',
  WEBSITE = 'website',
}

export interface ClientContact {
  id: string;
  // Core
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  // Address
  address: string;
  city: string;
  state: string;
  zip: string;
  // Business
  industry: string;
  website: string;
  socialLinks: Record<string, string>; // platform -> url
  // CRM
  status: ClientStatus;
  source: string; // How they found us: referral, google, social, etc.
  assignedTo: string; // Staff member
  tags: string[];
  // Financial summary (denormalized for fast reads)
  totalRevenue: number; // cents
  totalPaid: number; // cents
  outstandingBalance: number; // cents
  lastPaymentDate: number | null;
  // Engagement
  packageTier: 'budget' | 'premium' | 'elite' | 'custom' | null;
  currentPackage: string | null; // Package name
  // Metadata
  notes: string;
  createdAt: number;
  updatedAt: number;
  lastContactedAt: number | null;
  nextFollowUp: number | null;
  // Encryption
  encrypted: boolean;
}

export interface Deal {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  stage: DealStage;
  value: number; // cents
  probability: number; // 0-100
  expectedCloseDate: number;
  actualCloseDate: number | null;
  packageTier: 'budget' | 'premium' | 'elite' | 'custom' | null;
  lostReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Activity {
  id: string;
  clientId: string;
  type: ActivityType;
  title: string;
  description: string;
  channel: CommunicationChannel | null;
  scheduledAt: number | null;
  completedAt: number | null;
  createdAt: number;
  createdBy: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: 'contract' | 'invoice' | 'proposal' | 'brand_package' | 'other';
  url: string; // Firestore storage URL or base64
  size: number;
  createdAt: number;
}

export interface PipelineMetrics {
  totalLeads: number;
  totalActive: number;
  totalRevenue: number;
  avgDealValue: number;
  conversionRate: number;
  pipelineValue: number; // sum of open deal values * probability
  monthlyRecurring: number;
  overdueFollowUps: number;
}

export interface CRMFilters {
  status: ClientStatus | 'all';
  search: string;
  sortBy: 'name' | 'revenue' | 'lastContact' | 'created';
  sortDir: 'asc' | 'desc';
  tags: string[];
}
