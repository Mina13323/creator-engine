export interface User {
  id: string;
  email: string;
  name?: string;

  // Authentication
  password?: string;
  googleId?: string;

  createdAt: Date;
}

export interface FounderProfile {
  skills: string[];
  budget: number;
  industry: string;
  location: string;
  commitment: "part-time" | "full-time";
}

export interface AgentInput {
  projectId: string;
  founderProfile: FounderProfile;
  previousOutputs?: Record<string, any>;
}

export interface AgentOutput<T = any> {
  agentName: string;
  generatedAt: Date;
  summary: string;
  data: T;
  confidenceScore?: number;
  sources?: string[];
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  status: "draft" | "idea" | "validated" | "branded" | "marketing-ready" | "active";
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessPlanOutput {
  businessIdea: string;
  targetAudience: string;
  valueProposition: string;
  revenueModel: string[];
  mvpFeatures: string[];
}

export interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

export interface MarketResearchOutput {
  validationReport?: string;
  competitorAnalysis?: string;
  trendAnalysis?: string;
  processedAt?: string;
}

export interface FinancialForecastOutput {
  startupCost: number;
  monthlyExpenses: number;
  expectedRevenue: number;
  breakEvenMonth: number;
  profitProjection: number[];
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface BrandingOutput {
  brandName: string;
  slogan: string;
  tone: string;
  logoPrompt: string;
  colorPalette: ColorPalette;
}

export interface Campaign {
  platform: string;
  headline: string;
  description: string;
  callToAction: string;
}

export interface MarketingOutput {
  channels: string[];
  campaigns: Campaign[];
  contentIdeas: string[];
  socialMediaStrategy: string;
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  durationWeeks: number;
  tasks: string[];
  estimatedCost: number;
  dependencies: string[];
}

export interface ExecutionRoadmapOutput {
  milestones: RoadmapMilestone[];
  totalEstimatedBudget: number;
  totalDurationWeeks: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
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

export interface VentureProjectState {
  founderProfile: FounderProfile;
  businessPlan?: BusinessPlanOutput;
  marketResearch?: MarketResearchOutput;
  financialForecast?: FinancialForecastOutput;
  branding?: BrandingOutput;
  marketing?: MarketingOutput;
  roadmap?: ExecutionRoadmapOutput;
}

export interface IAgent<TOutput> {
  execute(input: AgentInput): Promise<AgentOutput<TOutput>>;
}

export interface ProjectResultsResponse {
  projectId: string;
  founderProfile: FounderProfile;
  businessPlan?: BusinessPlanOutput;
  marketResearch?: MarketResearchOutput;
  financialForecast?: FinancialForecastOutput;
  branding?: BrandingOutput;
  marketing?: MarketingOutput;
  roadmap?: ExecutionRoadmapOutput;
}
