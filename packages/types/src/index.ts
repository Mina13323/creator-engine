export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;

  // Authentication
  password?: string;
  googleId?: string;
  token?: string;

  // Admin
  isBanned?: boolean;

  createdAt: Date;
}

export interface FounderProfile {
  id: string;
  userId: string;
  projectId: string;
  
  // Inputs
  skills: string[];
  experience: string;
  industryInterests: string[];
  budget: number;
  location: string;
  availableTime: string;
  startupGoals: string;
  riskTolerance: string;
  teamSize: string;

  // AI Generated Outputs
  founderType?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendedBusinessModels?: string[];
  recommendedStartupTypes?: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingData {
  skills: string[];
  experience: string;
  industryInterests: string[];
  budget: number;
  location: string;
  availableTime: string;
  startupGoals: string;
  riskTolerance: string;
  teamSize: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  status: 'draft' | 'idea' | 'validated' | 'branded' | 'marketing-ready' | 'active' | 'archived';
  selectedOpportunityId?: string;
  
  // Admin
  isFlagged?: boolean;
  flagReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessIdea {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description: string;
  targetAudience: string;
  monetization: string[];
  skillsRequired: string[];
  score: number;
}

export interface BusinessOpportunity {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description: string;
  opportunityScore: number;
  founderFitScore: number;
  marketDemandScore: number;
  aiAdvantageScore: number;
  difficulty: string;
  startupCost: string;
  estimatedRevenue: string;
  timeToMVP: string;
}

export interface SelectedOpportunity {
  id: string;
  userId: string;
  projectId: string;
  opportunityId: string;
  title: string;
  description: string;
  opportunityScore: number;
  founderFitScore: number;
  marketDemandScore: number;
  aiAdvantageScore: number;
  difficulty: string;
  startupCost: string;
  estimatedRevenue: string;
  timeToMVP: string;
  createdAt: Date;
  selectedAt: Date;
}

export interface CompetitorAnalysis {
  name: string;
  marketShare: string;
  strengths: string[];
  weaknesses: string[];
}

export interface BusinessValidation {
  id: string;
  userId: string;
  projectId: string;
  feasibilityScore: number; // 0-100
  marketDemandScore: number; // 0-100
  riskScore: number; // 0-100
  competitors: CompetitorAnalysis[];
  marketSize: string;
  barriersToEntry: string[];
  validationSummary: string;
}

export interface LeanCanvas {
  problem: string[];
  solution: string[];
  keyMetrics: string[];
  uniqueValueProposition: string;
  unfairAdvantage: string;
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface BusinessModel {
  id: string;
  userId: string;
  projectId: string;
  leanCanvas: LeanCanvas;
  pricingStrategy: string;
  mvpScope: string[];
}

export interface BillingPlan {
  name: string;
}

export interface SubscriptionPlan {
  id?: string;
  name: string;
  slug: string;
  monthlyPriceEGP: number;
  monthlyCredits: number;
  maxProjects: number;
  features: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSubscription {
  id?: string;
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startsAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreditWallet {
  id?: string;
  userId: string;
  availableCredits: number;
  totalUsedCredits: number;
  totalPurchasedCredits: number;
  updatedAt?: Date;
}

export interface CreditTransaction {
  id?: string;
  userId: string;
  type: 'usage' | 'subscription' | 'topup' | 'refund';
  amount: number;
  feature: string;
  referenceId: string;
  createdAt?: Date;
}

export interface PaymentTransaction {
  id?: string;
  userId: string;
  amountEGP: number;
  paymentProvider: 'paymob';
  paymentIntentId: string;
  transactionId: string;
  status: 'pending' | 'paid' | 'failed';
  metadata: any;
  createdAt?: Date;
}

export interface BusinessPlan {
  id: string;
  userId: string;
  projectId: string;

  // SECTION 1 — EXECUTIVE SUMMARY
  executiveSummary: {
    startupName: string;
    mission: string;
    vision: string;
    valueProposition: string;
    executiveSummary: string;
    strategicPositioning: string;
  };

  // SECTION 2 — PROBLEM & SOLUTION
  problemAndSolution: {
    problem: string;
    solution: string;
    targetPainPoints: string[];
    customerNeeds: string[];
    uniqueAdvantages: string[];
    unfairAdvantage: string;
  };

  // SECTION 3 — BUSINESS MODEL
  businessModel: {
    revenueStreams: string[];
    pricingStrategy: string;
    acquisitionModel: string;
    salesModel: string;
    distributionChannels: string[];
    partnerships: string[];
    subscriptions: string[];
  };

  // SECTION 4 — VIABILITY ANALYSIS
  viabilityAnalysis: {
    marketOpportunityScore: number;
    founderFitScore: number;
    profitabilityScore: number;
    scalabilityScore: number;
    executionScore: number;
    overallScore: number;
    reasoning: string;
  };

  // SECTION 5 — MARKET RESEARCH
  marketResearch: {
    marketSize: string;
    industryGrowthRate: string;
    trends: string[];
    competitors: { name: string; strengths: string; weaknesses: string }[];
    marketGaps: string[];
    targetSegments: string[];
    customerBehavior: string;
  };

  // SECTION 6 — PRODUCTS & SERVICES
  productsAndServices: {
    coreOfferings: string[];
    premiumOfferings: string[];
    supportServices: string[];
    futureExpansionOpportunities: string[];
  };

  // SECTION 7 — SALES & MARKETING
  salesAndMarketing: {
    acquisitionChannels: string[];
    marketingFunnel: { awareness: string; interest: string; consideration: string; purchase: string; retention: string };
    customerRetention: string;
    onlinePresence: string;
    contentStrategy: string;
    growthStrategy: string;
  };

  // SECTION 8 — FINANCIAL INSIGHTS
  financialInsights: {
    revenueProjection: string;
    monthlyGrowth: string;
    breakEvenPoint: string;
    profitabilityTimeline: string;
    unitEconomics: string;
    keyRisks: string[];
    chartData: { month: string; revenue: number; cost: number }[];
  };

  // SECTION 9 — SWOT ANALYSIS
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // SECTION 10 — RISK ASSESSMENT
  riskAssessment: {
    marketRisks: string[];
    operationalRisks: string[];
    technicalRisks: string[];
    financialRisks: string[];
    mitigationStrategies: string[];
  };

  generatedByModel?: string;
  generatedAt?: Date;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandIdentity {
  id: string;
  userId: string;
  projectId: string;
  brandName: string;
  slogan: string;
  toneOfVoice: string;
  brandPositioning: string;
  logoPrompt: string;
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  brandPersonality: string[];
  brandStory: string;
  brandVoice: {
    dos: string[];
    donts: string[];
  };
  tagline: string;
  generatedByModel?: string;
  generatedAt?: Date;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingCampaignItem {
  name: string;
  platform: string;
  budget: number;
  goal: string;
  duration: string;
  tactics: string[];
}

export interface MarketingCampaign {
  id: string;
  userId: string;
  projectId: string;
  targetChannels: string[];
  budgetAllocation: Record<string, number>;
  adCopies: {
    platform: string;
    headline: string;
    body: string;
    callToAction: string;
  }[];
  contentHooks: string[];
  socialMediaStrategy: string;
  marketingPlan: string;
  launchPlan: string | Record<string, string>;
  campaigns: MarketingCampaignItem[];
  generatedByModel?: string;
  generatedAt?: Date;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PitchDeck {
  id: string;
  userId: string;
  projectId: string;
  startupPitch: string;
  investorSummary: string;
  elevatorPitch: string;
  problemStatement: string;
  solution: string;
  keyMetrics: {
    marketSize: string;
    revenueModel: string;
    targetCustomers: string;
    uniqueAdvantage: string;
    fundingAsk?: string;
  };
  traction: string;
  generatedByModel?: string;
  generatedAt?: Date;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  durationWeeks: number;
  dependencies: string[];
  tasks: string[];
  toolRecommendations: string[];
  estimatedCost: number;
}

export interface ExecutionRoadmap {
  id: string;
  userId: string;
  projectId: string;
  milestones: RoadmapMilestone[];
  totalEstimatedBudget: number;
  totalDurationWeeks: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
  ragSources?: string[];
}

export interface MarketResearchOutput {
  validationReport?: string;
  competitorAnalysis?: string;
  trendAnalysis?: string;
  processedAt?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  projectId: string;
  title?: string;
  messages: ChatMessage[];
  updatedAt: Date;
}

export interface VentureState {
  id: string;
  userId: string;
  projectId: string;
  founderProfile?: FounderProfile;
  selectedOpportunity?: SelectedOpportunity;
  businessPlan?: BusinessPlan;
  marketResearch?: MarketResearchOutput;
  latestBusinessPlan?: {
    id: string;
    version: number;
    generatedAt: Date;
    generatedByModel: string;
  };
  financialForecast?: any; // To be implemented in future modules
  branding?: BrandIdentity;
  marketing?: MarketingCampaign;
  pitchDeck?: PitchDeck;
  roadmap?: ExecutionRoadmap;
  lastUpdated: Date;
}

// ==========================================
// AUTH CONTRACTS
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  isBanned?: boolean;
  token?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface N8nWebhookResponse<T = any> {
  success: boolean;
  workflow: string;
  projectId: string;
  generatedAt: string;
  data: T;
  error?: string;
}

export interface AgentRun {
  id: string;
  userId: string;
  projectId: string;
  workflow:
    | "founder-analysis"
    | "opportunity-discovery"
    | "business-plan"
    | "financial"
    | "branding"
    | "marketing"
    | "pitch"
    | "roadmap"
    | "ai-cofounder"
    | "document-processing"
    | "opportunity-selection"
    | "system";
  status: "pending" | "running" | "success" | "failed";
  aiModel: string;
  provider: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  input: any;
  output?: any;
  error?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  createdAt: Date;
}

export interface UploadedDocument {
  id: string;
  userId: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  uploadedAt: Date;
}

export interface OpportunityComparison {
  id: string;
  projectId: string;
  selectedOpportunityIds: string[];
  createdAt: Date;
}

export interface MarketingStudioGeneration {
  id: string;
  userId: string;
  projectId: string;
  prompt: string;
  businessContextSnapshot: any;
  script: any;
  scenes: any[];
  images: { url: string; provider: string }[];
  video?: { url: string; provider: string; duration: number };
  voice?: { url: string };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'PARTIAL_SUCCESS';
  createdAt: Date;
}
