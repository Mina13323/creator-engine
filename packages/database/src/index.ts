import mongoose, { Schema, Document } from 'mongoose';
import {
  Project,
  BusinessIdea,
  BusinessOpportunity,
  SelectedOpportunity,
  BusinessValidation,
  BusinessModel,
  BusinessPlan,
  BrandIdentity,
  MarketingCampaign,
  ExecutionRoadmap,
  Conversation,
  User,
  FounderProfile,
  VentureState,
  AgentRun,
  UploadedDocument,
  OpportunityComparison,
  PitchDeck,
  SubscriptionPlan,
  UserSubscription,
  CreditWallet,
  CreditTransaction,
  PaymentTransaction
} from '@creator/types';

// MongoDB Connection
export async function connectDB(url: string) {
  const cleanUrl = url.replace(/^["']|["']$/g, '');
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(cleanUrl);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// 0. User Model
interface UserDocument extends User {
  password?: string;
  googleId?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  isBanned?: boolean;
  token?: string;
}

const UserSchema = new Schema<UserDocument & Document>(
  {
    // @ts-ignore - id is added for easier querying along with _id
    id: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    token: { type: String }
  },
  { timestamps: true }
);

// 0.5 Founder Profile Model
const FounderProfileSchema = new Schema<FounderProfile & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    skills: [{ type: String }],
    experience: { type: String },
    industryInterests: [{ type: String }],
    budget: { type: Number, required: true },
    location: { type: String },
    availableTime: { type: String },
    startupGoals: { type: String },
    riskTolerance: { type: String },
    teamSize: { type: String },
    founderType: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendedBusinessModels: [{ type: String }],
    recommendedStartupTypes: [{ type: String }]
  },
  { timestamps: true, collection: 'founder_profiles' }
);

// 1. Project Model
const ProjectSchema = new Schema<Project & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'idea', 'validated', 'branded', 'marketing-ready', 'active', 'archived'],
      default: 'draft'
    },
    selectedOpportunityId: { type: String },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String }
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, status: 1 });

// 2. Business Idea Model (Legacy, kept per spec)
const BusinessIdeaSchema = new Schema<BusinessIdea & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: { type: String, required: true },
    monetization: [{ type: String }],
    skillsRequired: [{ type: String }],
    score: { type: Number, default: 0 }
  },
  { timestamps: true, collection: 'business_ideas' }
);

// 2.1 Business Opportunity Model
const BusinessOpportunitySchema = new Schema<BusinessOpportunity & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    opportunityScore: { type: Number, required: true },
    founderFitScore: { type: Number, required: true },
    marketDemandScore: { type: Number, required: true },
    aiAdvantageScore: { type: Number, required: true },
    difficulty: { type: String, required: true },
    startupCost: { type: String, required: true },
    estimatedRevenue: { type: String, required: true },
    timeToMVP: { type: String, required: true }
  },
  { timestamps: true, collection: 'business_opportunities' }
);

// 2.2 Selected Opportunity Model
const SelectedOpportunitySchema = new Schema<SelectedOpportunity & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    opportunityId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    opportunityScore: { type: Number, required: true },
    founderFitScore: { type: Number, required: true },
    marketDemandScore: { type: Number, required: true },
    aiAdvantageScore: { type: Number, required: true },
    difficulty: { type: String, required: true },
    startupCost: { type: String, required: true },
    estimatedRevenue: { type: String, required: true },
    timeToMVP: { type: String, required: true },
    selectedAt: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true, collection: 'selected_opportunities' }
);

// 3. Business Validation Model
const CompetitorSchema = new Schema({
  name: { type: String, required: true },
  marketShare: { type: String, required: true },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }]
});

const BusinessValidationSchema = new Schema<BusinessValidation & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    feasibilityScore: { type: Number, required: true },
    marketDemandScore: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    competitors: [CompetitorSchema],
    marketSize: { type: String, required: true },
    barriersToEntry: [{ type: String }],
    validationSummary: { type: String, required: true }
  },
  { timestamps: true, collection: 'business_validations' }
);

// 4. Business Strategy / Model Model
const LeanCanvasSchema = new Schema({
  problem: [{ type: String }],
  solution: [{ type: String }],
  keyMetrics: [{ type: String }],
  uniqueValueProposition: { type: String, required: true },
  unfairAdvantage: { type: String, required: true },
  channels: [{ type: String }],
  customerSegments: [{ type: String }],
  costStructure: [{ type: String }],
  revenueStreams: [{ type: String }]
});

const BusinessModelSchema = new Schema<BusinessModel & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    leanCanvas: { type: LeanCanvasSchema, required: true },
    pricingStrategy: { type: String, required: true },
    mvpScope: [{ type: String }]
  },
  { timestamps: true, collection: 'business_models' }
);

// 4.5 Business Plan Model
const BusinessPlanSchema = new Schema<BusinessPlan & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    
    // SECTION 1 — EXECUTIVE SUMMARY
    executiveSummary: {
      startupName: { type: String },
      mission: { type: String },
      vision: { type: String },
      valueProposition: { type: String },
      executiveSummary: { type: String },
      strategicPositioning: { type: String },
    },

    // SECTION 2 — PROBLEM & SOLUTION
    problemAndSolution: {
      problem: { type: String },
      solution: { type: String },
      targetPainPoints: [{ type: String }],
      customerNeeds: [{ type: String }],
      uniqueAdvantages: [{ type: String }],
      unfairAdvantage: { type: String },
    },

    // SECTION 3 — BUSINESS MODEL
    businessModel: {
      revenueStreams: [{ type: String }],
      pricingStrategy: { type: String },
      acquisitionModel: { type: String },
      salesModel: { type: String },
      distributionChannels: [{ type: String }],
      partnerships: [{ type: String }],
      subscriptions: [{ type: String }],
    },

    // SECTION 4 — VIABILITY ANALYSIS
    viabilityAnalysis: {
      marketOpportunityScore: { type: Number },
      founderFitScore: { type: Number },
      profitabilityScore: { type: Number },
      scalabilityScore: { type: Number },
      executionScore: { type: Number },
      overallScore: { type: Number },
      reasoning: { type: String },
    },

    // SECTION 5 — MARKET RESEARCH
    marketResearch: {
      marketSize: { type: String },
      industryGrowthRate: { type: String },
      trends: [{ type: String }],
      competitors: [{
        name: { type: String },
        strengths: { type: String },
        weaknesses: { type: String }
      }],
      marketGaps: [{ type: String }],
      targetSegments: [{ type: String }],
      customerBehavior: { type: String }
    },

    // SECTION 6 — PRODUCTS & SERVICES
    productsAndServices: {
      coreOfferings: [{ type: String }],
      premiumOfferings: [{ type: String }],
      supportServices: [{ type: String }],
      futureExpansionOpportunities: [{ type: String }]
    },

    // SECTION 7 — SALES & MARKETING
    salesAndMarketing: {
      acquisitionChannels: [{ type: String }],
      marketingFunnel: {
        awareness: { type: String },
        interest: { type: String },
        consideration: { type: String },
        purchase: { type: String },
        retention: { type: String }
      },
      customerRetention: { type: String },
      onlinePresence: { type: String },
      contentStrategy: { type: String },
      growthStrategy: { type: String }
    },

    // SECTION 8 — FINANCIAL INSIGHTS
    financialInsights: {
      revenueProjection: { type: String },
      monthlyGrowth: { type: String },
      breakEvenPoint: { type: String },
      profitabilityTimeline: { type: String },
      unitEconomics: { type: String },
      keyRisks: [{ type: String }],
      chartData: [{
        month: { type: String },
        revenue: { type: Number },
        cost: { type: Number }
      }]
    },

    // SECTION 9 — SWOT ANALYSIS
    swotAnalysis: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }]
    },

    // SECTION 10 — RISK ASSESSMENT
    riskAssessment: {
      marketRisks: [{ type: String }],
      operationalRisks: [{ type: String }],
      technicalRisks: [{ type: String }],
      financialRisks: [{ type: String }],
      mitigationStrategies: [{ type: String }]
    },

    isLatest: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    generatedByModel: { type: String },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'business_plans' }
);

// 5. Brand Identity Model
const BrandIdentitySchema = new Schema<BrandIdentity & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    brandName: { type: String, default: '' },
    tagline: { type: String, default: '' },
    slogan: { type: String, default: '' },
    toneOfVoice: { type: String, default: '' },
    brandPositioning: { type: String, default: '' },
    brandPersonality: [{ type: String }],
    brandStory: { type: String, default: '' },
    brandVoice: {
      dos: [{ type: String }],
      donts: [{ type: String }]
    },
    logoPrompt: { type: String, default: '' },
    colorPalette: {
      primary: { type: String, default: '' },
      secondary: { type: String, default: '' },
      background: { type: String, default: '' },
      accent: { type: String, default: '' }
    },
    generatedByModel: { type: String },
    generatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'brand_identities' }
);

// 6. Marketing Campaign Model
const MarketingCampaignItemSchema = new Schema({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  budget: { type: Number, default: 0 },
  goal: { type: String, required: true },
  duration: { type: String, required: true },
  tactics: [{ type: String }]
});

const MarketingCampaignSchema = new Schema<MarketingCampaign & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    marketingPlan: { type: String, default: '' },
    launchPlan: { type: Schema.Types.Mixed, default: '' },
    campaigns: [MarketingCampaignItemSchema],
    targetChannels: [{ type: String }],
    budgetAllocation: { type: Map, of: Number },
    adCopies: [
      {
        platform: { type: String, required: true },
        headline: { type: String, required: true },
        body: { type: String, required: true },
        callToAction: { type: String, required: true }
      }
    ],
    contentHooks: [{ type: String }],
    socialMediaStrategy: { type: String, default: '' },
    generatedByModel: { type: String },
    generatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'marketing_campaigns' }
);

// 6.5 Pitch Deck Model
const PitchDeckSchema = new Schema<PitchDeck & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    startupPitch: { type: String, default: '' },
    investorSummary: { type: String, default: '' },
    elevatorPitch: { type: String, default: '' },
    problemStatement: { type: String, default: '' },
    solution: { type: String, default: '' },
    keyMetrics: {
      marketSize: { type: String },
      revenueModel: { type: String },
      targetCustomers: { type: String },
      uniqueAdvantage: { type: String },
      fundingAsk: { type: String }
    },
    traction: { type: String },
    generatedByModel: { type: String },
    generatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'pitch_decks' }
);

// 7. Execution Roadmap Model
const RoadmapMilestoneSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  durationWeeks: { type: Number, required: true },
  dependencies: [{ type: String }],
  tasks: [{ type: String }],
  toolRecommendations: [{ type: String }],
  estimatedCost: { type: Number, required: true }
});

const ExecutionRoadmapSchema = new Schema<ExecutionRoadmap & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    milestones: [RoadmapMilestoneSchema],
    totalEstimatedBudget: { type: Number, required: true },
    totalDurationWeeks: { type: Number, required: true }
  },
  { timestamps: true }
);

// 8. Cofounder Conversation Model
const ChatMessageSchema = new Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ragSources: [{ type: String }]
});

const ConversationSchema = new Schema<Conversation & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String },
    messages: [ChatMessageSchema]
  },
  { timestamps: true }
);

// 9. Venture State Model
const VentureStateSchema = new Schema<VentureState & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    founderProfile: { type: Schema.Types.Mixed },
    selectedOpportunity: { type: Schema.Types.Mixed },
    latestBusinessPlan: { type: Schema.Types.Mixed },
    financialForecast: { type: Schema.Types.Mixed },
    branding: { type: Schema.Types.Mixed },
    marketing: { type: Schema.Types.Mixed },
    pitchDeck: { type: Schema.Types.Mixed },
    roadmap: { type: Schema.Types.Mixed },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'venture_states' }
);

// 10. Agent Run Model
const AgentRunSchema = new Schema<AgentRun & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    workflow: { type: String, required: true },
    status: { type: String, enum: ['pending', 'running', 'success', 'failed'], required: true },
    aiModel: { type: String, required: true },
    provider: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    durationMs: { type: Number },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed },
    error: { type: String },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 11. Uploaded Document Model
const UploadedDocumentSchema = new Schema<UploadedDocument & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    storageUrl: { type: String, required: true },
    processingStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 12. Opportunity Comparison Model
const OpportunityComparisonSchema = new Schema<OpportunityComparison & Document>(
  {
    id: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    selectedOpportunityIds: [{ type: String, required: true }]
  },
  { timestamps: true }
);

const schemasWithIsLatest = [
  FounderProfileSchema, BusinessPlanSchema, BrandIdentitySchema, 
  MarketingCampaignSchema, PitchDeckSchema, ExecutionRoadmapSchema
];
schemasWithIsLatest.forEach(schema => {
  schema.index({ projectId: 1, userId: 1 });
  schema.index({ projectId: 1, isLatest: 1 });
  schema.index({ projectId: 1, userId: 1, isLatest: 1 });
});

// Export Mongoose Models
export const UserModel = mongoose.models.User || mongoose.model<UserDocument & Document>('User', UserSchema);
export const FounderProfileModel = mongoose.models.FounderProfile || mongoose.model<FounderProfile & Document>('FounderProfile', FounderProfileSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model<Project & Document>('Project', ProjectSchema);
export const BusinessIdeaModel = mongoose.models.BusinessIdea || mongoose.model<BusinessIdea & Document>('BusinessIdea', BusinessIdeaSchema);
export const BusinessOpportunityModel = mongoose.models.BusinessOpportunity || mongoose.model<BusinessOpportunity & Document>('BusinessOpportunity', BusinessOpportunitySchema);
export const SelectedOpportunityModel = mongoose.models.SelectedOpportunity || mongoose.model<SelectedOpportunity & Document>('SelectedOpportunity', SelectedOpportunitySchema);
export const BusinessValidationModel = mongoose.models.BusinessValidation || mongoose.model<BusinessValidation & Document>('BusinessValidation', BusinessValidationSchema);
export const BusinessModelModel = mongoose.models.BusinessModel || mongoose.model<BusinessModel & Document>('BusinessModel', BusinessModelSchema);
export const BusinessPlanModel = mongoose.models.BusinessPlan || mongoose.model<BusinessPlan & Document>('BusinessPlan', BusinessPlanSchema);
export const BrandIdentityModel = mongoose.models.BrandIdentity || mongoose.model<BrandIdentity & Document>('BrandIdentity', BrandIdentitySchema);
export const MarketingCampaignModel = mongoose.models.MarketingCampaign || mongoose.model<MarketingCampaign & Document>('MarketingCampaign', MarketingCampaignSchema);
export const PitchDeckModel = mongoose.models.PitchDeck || mongoose.model<PitchDeck & Document>('PitchDeck', PitchDeckSchema);
export const ExecutionRoadmapModel = mongoose.models.ExecutionRoadmap || mongoose.model<ExecutionRoadmap & Document>('ExecutionRoadmap', ExecutionRoadmapSchema);
export const ConversationModel = mongoose.models.Conversation || mongoose.model<Conversation & Document>('Conversation', ConversationSchema);
export const VentureStateModel = mongoose.models.VentureState || mongoose.model<VentureState & Document>('VentureState', VentureStateSchema);
export const AgentRunModel = mongoose.models.AgentRun || mongoose.model<AgentRun & Document>('AgentRun', AgentRunSchema);
export const UploadedDocumentModel = mongoose.models.UploadedDocument || mongoose.model<UploadedDocument & Document>('UploadedDocument', UploadedDocumentSchema);
export const OpportunityComparisonModel = mongoose.models.OpportunityComparison || mongoose.model<OpportunityComparison & Document>('OpportunityComparison', OpportunityComparisonSchema);

// Knowledge Document for RAG
export interface KnowledgeDocument {
  userId?: string;
  projectId?: string;
  documentId?: string;
  docId?: string;
  content: string;
  category: string;
  source: string;
  embedding?: number[];
}

const KnowledgeDocumentSchema = new Schema<KnowledgeDocument & Document>({
  userId: { type: String },
  projectId: { type: String },
  documentId: { type: String },
  docId: { type: String },
  content: { type: String, required: true },
  category: { type: String, required: true },
  source: { type: String, required: true },
  embedding: { type: [Number] }
}, { timestamps: true, collection: 'knowledge_vectors' });

export const KnowledgeDocumentModel = mongoose.models.KnowledgeDocument || mongoose.model<KnowledgeDocument & Document>('KnowledgeDocument', KnowledgeDocumentSchema);

// --- Financial Plan Interfaces ---
export interface IStartupCost {
  category: string;
  amount: number;
  description?: string;
}

export interface IMonthlyCost {
  category: string;
  amount: number;
  isVariable: boolean;
  description?: string;
}

export interface IRevenueProjection {
  month: number;
  projected_revenue: number;
  cumulative_revenue: number;
}

export interface IFinancialForecast extends Document {
  projectId: string;
  startupCosts: IStartupCost[];
  totalStartupCost: number;
  monthlyCosts: IMonthlyCost[];
  totalMonthlyCost: number;
  revenueProjections: IRevenueProjection[];
  breakEvenMonth: number | null;
  currency: 'EGP' | 'USD';
  assumptionsApplied: string[];
  updatedAt: Date;
}

export interface IPriceTier {
  tierName: 'Free' | 'Pro' | 'Enterprise' | string;
  amount: number;
  billingCycle: 'monthly' | 'annual' | 'one-time';
  targetSegment: string;
  features: string[];
  justification: string;
}

export interface IPricingStrategy extends Document {
  projectId: string;
  businessModel: 'SaaS' | 'Agency retainer' | 'E-commerce' | 'Freelance' | string;
  recommendedStrategyType: string;
  currency: 'EGP' | 'USD';
  priceTiers: IPriceTier[];
  marketPositioningRationale: string;
  updatedAt: Date;
}

// --- Financial Plan Schemas ---
export const StartupCostSchema = new Schema<IStartupCost>({
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String }
}, { _id: false });

export const MonthlyCostSchema = new Schema<IMonthlyCost>({
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  isVariable: { type: Boolean, default: false },
  description: { type: String }
}, { _id: false });

export const RevenueProjectionSchema = new Schema<IRevenueProjection>({
  month: { type: Number, required: true, min: 1, max: 12 },
  projected_revenue: { type: Number, required: true, min: 0 },
  cumulative_revenue: { type: Number, required: true, min: 0 }
}, { _id: false });

export const FinancialForecastSchema = new Schema<IFinancialForecast>({
  projectId: { type: String, required: true, index: true },
  startupCosts: [StartupCostSchema],
  totalStartupCost: { type: Number, required: true, default: 0 },
  monthlyCosts: [MonthlyCostSchema],
  totalMonthlyCost: { type: Number, required: true, default: 0 },
  revenueProjections: [RevenueProjectionSchema],
  breakEvenMonth: { type: Number, default: null, min: 1, max: 12 },
  currency: { type: String, enum: ['EGP', 'USD'], default: 'EGP' },
  assumptionsApplied: [{ type: String }]
}, { timestamps: true });

export const PriceTierSchema = new Schema<IPriceTier>({
  tierName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  billingCycle: { type: String, enum: ['monthly', 'annual', 'one-time'], required: true },
  targetSegment: { type: String, required: true },
  features: [{ type: String }],
  justification: { type: String }
}, { _id: false });

export const PricingStrategySchema = new Schema<IPricingStrategy>({
  projectId: { type: String, required: true, index: true },
  businessModel: { type: String, required: true },
  recommendedStrategyType: { type: String, required: true },
  currency: { type: String, enum: ['EGP', 'USD'], default: 'EGP' },
  priceTiers: [PriceTierSchema],
  marketPositioningRationale: { type: String, required: true }
}, { timestamps: true });

// Pre-save Hooks for Mathematical Integrity
FinancialForecastSchema.pre<IFinancialForecast>('save', function () {
  this.totalStartupCost = this.startupCosts.reduce((sum: number, item: any) => sum + item.amount, 0);
  this.totalMonthlyCost = this.monthlyCosts.reduce((sum: number, item: any) => sum + item.amount, 0);
});

export const FinancialForecast = mongoose.models.FinancialForecast || mongoose.model<IFinancialForecast>('FinancialForecast', FinancialForecastSchema);
export const PricingStrategy = mongoose.models.PricingStrategy || mongoose.model<IPricingStrategy>('PricingStrategy', PricingStrategySchema);

// Monetization Schemas
const SubscriptionPlanSchema = new Schema<SubscriptionPlan & Document>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    monthlyPriceEGP: { type: Number, required: true },
    monthlyCredits: { type: Number, required: true },
    maxProjects: { type: Number, required: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'subscription_plans' }
);

const UserSubscriptionSchema = new Schema<UserSubscription & Document>(
  {
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'pending' },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'user_subscriptions' }
);

const CreditWalletSchema = new Schema<CreditWallet & Document>(
  {
    userId: { type: String, required: true, index: true, unique: true },
    availableCredits: { type: Number, required: true, default: 0 },
    totalUsedCredits: { type: Number, required: true, default: 0 },
    totalPurchasedCredits: { type: Number, required: true, default: 0 }
  },
  { timestamps: true, collection: 'credit_wallets' }
);

const CreditTransactionSchema = new Schema<CreditTransaction & Document>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['usage', 'subscription', 'topup', 'refund'], required: true },
    amount: { type: Number, required: true },
    feature: { type: String, required: true },
    referenceId: { type: String }
  },
  { timestamps: true, collection: 'credit_transactions' }
);

const PaymentTransactionSchema = new Schema<PaymentTransaction & Document>(
  {
    userId: { type: String, required: true, index: true },
    amountEGP: { type: Number, required: true },
    paymentProvider: { type: String, enum: ['paymob'], default: 'paymob' },
    paymentIntentId: { type: String, required: true },
    transactionId: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true, collection: 'payment_transactions' }
);

const CreditPackSchema = new Schema<any & Document>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    priceEGP: { type: Number, required: true },
    credits: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'credit_packs' }
);

export const SubscriptionPlanModel = mongoose.models.SubscriptionPlan || mongoose.model<SubscriptionPlan & Document>('SubscriptionPlan', SubscriptionPlanSchema);
export const UserSubscriptionModel = mongoose.models.UserSubscription || mongoose.model<UserSubscription & Document>('UserSubscription', UserSubscriptionSchema);
export const CreditWalletModel = mongoose.models.CreditWallet || mongoose.model<CreditWallet & Document>('CreditWallet', CreditWalletSchema);
export const CreditTransactionModel = mongoose.models.CreditTransaction || mongoose.model<CreditTransaction & Document>('CreditTransaction', CreditTransactionSchema);
export const PaymentTransactionModel = mongoose.models.PaymentTransaction || mongoose.model<PaymentTransaction & Document>('PaymentTransaction', PaymentTransactionSchema);
export const CreditPackModel = mongoose.models.CreditPack || mongoose.model<any & Document>('CreditPack', CreditPackSchema);

export interface AdminSettings {
  key: string;
  defaultModel: string;
  aiTemperature: number;
  maxTokensPerRun: number;
  freeCredits: number;
  maxProjects: number;
  lockdown: boolean;
  maintenance: boolean;
  flagAlerts: boolean;
  weeklyReports: boolean;
}

const AdminSettingsSchema = new Schema<AdminSettings & Document>(
  {
    key: { type: String, default: 'global_config', unique: true, index: true },
    defaultModel: { type: String, default: 'deepseek-v4-flash' },
    aiTemperature: { type: Number, default: 0.7 },
    maxTokensPerRun: { type: Number, default: 150000 },
    freeCredits: { type: Number, default: 50 },
    maxProjects: { type: Number, default: 5 },
    lockdown: { type: Boolean, default: false },
    maintenance: { type: Boolean, default: false },
    flagAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'admin_settings' }
);

export const AdminSettingsModel = mongoose.models.AdminSettings || mongoose.model<AdminSettings & Document>('AdminSettings', AdminSettingsSchema);


export * from './services/projectContext';
