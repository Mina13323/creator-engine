export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface OnboardingData {
  skills: string[];
  budget: number;
  industry: string;
  location: string;
  commitment: 'part-time' | 'full-time';
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
  projectId: string;
  title: string;
  description: string;
  targetAudience: string;
  monetization: string[];
  skillsRequired: string[];
  score: number; // Overall matching score
}

export interface CompetitorAnalysis {
  name: string;
  marketShare: string;
  strengths: string[];
  weaknesses: string[];
}

export interface BusinessValidation {
  id: string;
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
  projectId: string;
  leanCanvas: LeanCanvas;
  pricingStrategy: string;
  mvpScope: string[];
}

export interface BrandIdentity {
  id: string;
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
  projectId: string;
  messages: ChatMessage[];
  updatedAt: Date;
}
