import mongoose, { Schema, Document } from 'mongoose';
import {
  User,
  Project,
  BusinessPlanOutput,
  MarketResearchOutput,
  FinancialForecastOutput,
  BrandingOutput,
  MarketingOutput,
  ExecutionRoadmapOutput,
  Conversation,
  FounderProfile
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
    id: { type: String, required: true, index: true },
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

// We need a way to store FounderProfile
// It can be attached to the Project, or stored as its own document.
// Since ProjectResultsResponse returns it directly, let's create a FounderProfileModel
const FounderProfileSchema = new Schema<FounderProfile & Document & { projectId: string }>(
  {
    projectId: { type: String, required: true, index: true },
    skills: [{ type: String }],
    budget: { type: Number, required: true },
    industry: { type: String, required: true },
    location: { type: String, required: true },
    commitment: { type: String, enum: ['part-time', 'full-time'], required: true }
  },
  { timestamps: true }
);

// 2. Business Plan Output
const BusinessPlanSchema = new Schema<BusinessPlanOutput & Document & { projectId: string }>(
  {
    projectId: { type: String, required: true, index: true },
    businessIdea: { type: String, required: true },
    targetAudience: { type: String, required: true },
    valueProposition: { type: String, required: true },
    revenueModel: [{ type: String }],
    mvpFeatures: [{ type: String }]
  },
  { timestamps: true }
);

const MarketResearchSchema = new Schema<MarketResearchOutput & Document & { projectId: string }>(
  {
    projectId: { type: String, required: true, index: true },
    validationReport: { type: String },
    competitorAnalysis: { type: String },
    trendAnalysis: { type: String },
    processedAt: { type: String }
  },
  { timestamps: true, collection: 'marketresearches' } // Using standard plural for Mongoose
);

// 4. Financial Forecast Output
const FinancialForecastSchema = new Schema<FinancialForecastOutput & Document & { projectId: string }>(
  {
    projectId: { type: String, required: true, index: true },
    startupCost: { type: Number, required: true },
    monthlyExpenses: { type: Number, required: true },
    expectedRevenue: { type: Number, required: true },
    breakEvenMonth: { type: Number, required: true },
    profitProjection: [{ type: Number }]
  },
  { timestamps: true }
);

// 5. Branding Output
const ColorPaletteSchema = new Schema({
  primary: { type: String, required: true },
  secondary: { type: String, required: true },
  accent: { type: String, required: true },
  background: { type: String, required: true }
}, { _id: false });

const BrandingSchema = new Schema<BrandingOutput & Document & { projectId: string }>(
  {
    projectId: { type: String, required: true, index: true },
    brandName: { type: String, required: true },
    slogan: { type: String, required: true },
    tone: { type: String, required: true },
    logoPrompt: { type: String, required: true },
    colorPalette: { type: ColorPaletteSchema, required: true }
  },
  { timestamps: true }
);

// 6. Marketing Output
const CampaignSchema = new Schema({
  platform: { type: String, required: true },
  headline: { type: String, required: true },
  description: { type: String, required: true },
  callToAction: { type: String, required: true }
}, { _id: false });

const MarketingSchema = new Schema<MarketingOutput & Document & { projectId: string }>(
  {
    projectId: { type: String, required: true, index: true },
    channels: [{ type: String }],
    campaigns: [CampaignSchema],
    contentIdeas: [{ type: String }],
    socialMediaStrategy: { type: String, required: true }
  },
  { timestamps: true }
);

// 7. Execution Roadmap Output
const RoadmapMilestoneSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  durationWeeks: { type: Number, required: true },
  tasks: [{ type: String }],
  estimatedCost: { type: Number, required: true },
  dependencies: [{ type: String }]
}, { _id: false });

const ExecutionRoadmapSchema = new Schema<ExecutionRoadmapOutput & Document & { projectId: string }>(
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
}, { _id: false });

const ConversationSchema = new Schema<Conversation & Document>(
  {
    id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    messages: [ChatMessageSchema]
  },
  { timestamps: true }
);

// Export Mongoose Models
export const UserModel = mongoose.models.User || mongoose.model<UserDocument & Document>('User', UserSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model<Project & Document>('Project', ProjectSchema);
export const FounderProfileModel = mongoose.models.FounderProfile || mongoose.model<FounderProfile & Document & { projectId: string }>('FounderProfile', FounderProfileSchema);
export const BusinessPlanModel = mongoose.models.BusinessPlan || mongoose.model<BusinessPlanOutput & Document & { projectId: string }>('BusinessPlan', BusinessPlanSchema);
export const MarketResearchModel = mongoose.models.MarketResearch || mongoose.model<MarketResearchOutput & Document & { projectId: string }>('MarketResearch', MarketResearchSchema);
export const FinancialForecastModel = mongoose.models.FinancialForecast || mongoose.model<FinancialForecastOutput & Document & { projectId: string }>('FinancialForecast', FinancialForecastSchema);
export const BrandingModel = mongoose.models.Branding || mongoose.model<BrandingOutput & Document & { projectId: string }>('Branding', BrandingSchema);
export const MarketingModel = mongoose.models.Marketing || mongoose.model<MarketingOutput & Document & { projectId: string }>('Marketing', MarketingSchema);
export const ExecutionRoadmapModel = mongoose.models.ExecutionRoadmap || mongoose.model<ExecutionRoadmapOutput & Document & { projectId: string }>('ExecutionRoadmap', ExecutionRoadmapSchema);
export const ConversationModel = mongoose.models.Conversation || mongoose.model<Conversation & Document>('Conversation', ConversationSchema);
