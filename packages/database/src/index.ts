import mongoose, { Schema, Document } from 'mongoose';
import {
  Project,
  BusinessIdea,
  BusinessValidation,
  BusinessModel,
  BrandIdentity,
  MarketingCampaign,
  ExecutionRoadmap,
  Conversation,
  User
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
}

const UserSchema = new Schema<UserDocument & Document>(
  {
    id: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String },
    googleId: { type: String }
  },
  { timestamps: true }
);

// 1. Project Model
const ProjectSchema = new Schema<Project & Document>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'idea', 'validated', 'branded', 'marketing-ready', 'active'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

// 2. Business Idea Model
const BusinessIdeaSchema = new Schema<BusinessIdea & Document>(
  {
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: { type: String, required: true },
    monetization: [{ type: String }],
    skillsRequired: [{ type: String }],
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
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
    projectId: { type: String, required: true, index: true },
    feasibilityScore: { type: Number, required: true },
    marketDemandScore: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    competitors: [CompetitorSchema],
    marketSize: { type: String, required: true },
    barriersToEntry: [{ type: String }],
    validationSummary: { type: String, required: true }
  },
  { timestamps: true }
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
    projectId: { type: String, required: true, index: true },
    leanCanvas: { type: LeanCanvasSchema, required: true },
    pricingStrategy: { type: String, required: true },
    mvpScope: [{ type: String }]
  },
  { timestamps: true }
);

// 5. Brand Identity Model
const BrandIdentitySchema = new Schema<BrandIdentity & Document>(
  {
    projectId: { type: String, required: true, index: true },
    brandName: { type: String, required: true },
    slogan: { type: String, required: true },
    toneOfVoice: { type: String, required: true },
    brandPositioning: { type: String, required: true },
    logoPrompt: { type: String, required: true },
    colorPalette: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      background: { type: String, required: true },
      accent: { type: String, required: true }
    }
  },
  { timestamps: true }
);

// 6. Marketing Campaign Model
const MarketingCampaignSchema = new Schema<MarketingCampaign & Document>(
  {
    projectId: { type: String, required: true, index: true },
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
    socialMediaStrategy: { type: String, required: true }
  },
  { timestamps: true }
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
    projectId: { type: String, required: true, index: true },
    messages: [ChatMessageSchema]
  },
  { timestamps: true }
);

// Export Mongoose Models
export const UserModel = mongoose.models.User || mongoose.model<UserDocument & Document>('User', UserSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model<Project & Document>('Project', ProjectSchema);
export const BusinessIdeaModel = mongoose.models.BusinessIdea || mongoose.model<BusinessIdea & Document>('BusinessIdea', BusinessIdeaSchema);
export const BusinessValidationModel = mongoose.models.BusinessValidation || mongoose.model<BusinessValidation & Document>('BusinessValidation', BusinessValidationSchema);
export const BusinessModelModel = mongoose.models.BusinessModel || mongoose.model<BusinessModel & Document>('BusinessModel', BusinessModelSchema);
export const BrandIdentityModel = mongoose.models.BrandIdentity || mongoose.model<BrandIdentity & Document>('BrandIdentity', BrandIdentitySchema);
export const MarketingCampaignModel = mongoose.models.MarketingCampaign || mongoose.model<MarketingCampaign & Document>('MarketingCampaign', MarketingCampaignSchema);
export const ExecutionRoadmapModel = mongoose.models.ExecutionRoadmap || mongoose.model<ExecutionRoadmap & Document>('ExecutionRoadmap', ExecutionRoadmapSchema);
export const ConversationModel = mongoose.models.Conversation || mongoose.model<Conversation & Document>('Conversation', ConversationSchema);

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
