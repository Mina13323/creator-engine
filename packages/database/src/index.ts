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
  PitchDeck
} from '@creator/types';

// MongoDB Connection
export async function connectDB(url: string) {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(url);
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
}

const UserSchema = new Schema<UserDocument & Document>(
  {
    id: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String }
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
    experience: { type: String, required: true },
    industryInterests: [{ type: String }],
    budget: { type: Number, required: true },
    location: { type: String, required: true },
    availableTime: { type: String, required: true },
    startupGoals: { type: String, required: true },
    riskTolerance: { type: String, required: true },
    teamSize: { type: String, required: true },
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
      enum: ['draft', 'idea', 'validated', 'branded', 'marketing-ready', 'active'],
      default: 'draft'
    },
    selectedOpportunityId: { type: String }
  },
  { timestamps: true }
);

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
    executiveSummary: { type: String, required: true },
    problemStatement: { type: String, required: true },
    solution: { type: String, required: true },
    targetAudience: { type: String, required: true },
    marketOpportunity: { type: String, required: true },
    leanCanvas: { type: LeanCanvasSchema, required: true },
    customerSegments: [{ type: String }],
    businessModel: { type: String, required: true },
    revenueModel: { type: String },
    pricingStrategy: { type: String, required: true },
    goToMarketStrategy: { type: String, required: true },
    mvpScope: [{ type: String }],
    successMetrics: [{ type: String }],
    growthStrategy: { type: String, required: true },
    marketResearchSummary: { type: String },
    generatedByModel: { type: String },
    generatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'business_plans' }
);

// 5. Brand Identity Model
const BrandIdentitySchema = new Schema<BrandIdentity & Document>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    brandName: { type: String, required: true },
    tagline: { type: String, default: '' },
    slogan: { type: String, required: true },
    toneOfVoice: { type: String, required: true },
    brandPositioning: { type: String, required: true },
    brandPersonality: [{ type: String }],
    brandStory: { type: String, default: '' },
    brandVoice: {
      dos: [{ type: String }],
      donts: [{ type: String }]
    },
    logoPrompt: { type: String, required: true },
    colorPalette: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      background: { type: String, required: true },
      accent: { type: String, required: true }
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
    socialMediaStrategy: { type: String, required: true },
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
    startupPitch: { type: String, required: true },
    investorSummary: { type: String, required: true },
    elevatorPitch: { type: String, required: true },
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
    error: { type: String }
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
  projectId: mongoose.Types.ObjectId;
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
  projectId: mongoose.Types.ObjectId;
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
  projectId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
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
  projectId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
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
