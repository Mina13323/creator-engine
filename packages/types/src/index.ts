export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;

  // Authentication
  password?: string;
  googleId?: string;

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
  status: 'draft' | 'idea' | 'validated' | 'branded' | 'marketing-ready' | 'active';
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

export interface BusinessPlan {
  id: string;
  userId: string;
  projectId: string;
  executiveSummary: string;
  problemStatement: string;
  solution: string;
  marketOpportunity: string;
  leanCanvas: LeanCanvas;
  customerSegments: string[];
  revenueModel: string;
  pricingStrategy: string;
  goToMarketStrategy: string;
  mvpScope: string;
  successMetrics: string[];
  growthStrategy: string;
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

export interface Conversation {
  id: string;
  userId: string;
  projectId: string;
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
  financialForecast?: any; // To be implemented in future modules
  branding?: BrandIdentity;
  marketing?: MarketingCampaign;
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
    | "roadmap"
    | "ai-cofounder";
  status: "pending" | "running" | "success" | "failed";
  aiModel: string;
  provider: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  input: any;
  output?: any;
  error?: string;
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
