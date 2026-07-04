import { 
  ProjectModel,
  FounderProfileModel, 
  SelectedOpportunityModel, 
  BusinessPlanModel, 
  FinancialForecast, 
  BrandIdentityModel, 
  MarketingCampaignModel, 
  PitchDeckModel, 
  ExecutionRoadmapModel, 
  UploadedDocumentModel 
} from '../index';

export async function getProjectContext(projectId: string, userId: string) {
  const [
    project,
    founderProfile,
    selectedOpportunity,
    businessPlan,
    financialForecast,
    branding,
    marketingPlan,
    pitchDeck,
    roadmap,
    uploadedDocuments
  ] = await Promise.all([
    ProjectModel.findOne({ id: projectId, userId }),
    FounderProfileModel.findOne({ userId, isLatest: true }),
    SelectedOpportunityModel.findOne({ projectId, userId }),
    BusinessPlanModel.findOne({ projectId, userId, isLatest: true }),
    FinancialForecast.findOne({ projectId }),
    BrandIdentityModel.findOne({ projectId, userId, isLatest: true }),
    MarketingCampaignModel.findOne({ projectId, userId, isLatest: true }),
    PitchDeckModel.findOne({ projectId, userId, isLatest: true }),
    ExecutionRoadmapModel.findOne({ projectId, userId, isLatest: true }),
    UploadedDocumentModel.find({ projectId, userId })
  ]);

  return {
    project: project?.toObject() || null,
    founderProfile: founderProfile?.toObject() || null,
    selectedOpportunity: selectedOpportunity?.toObject() || null,
    businessPlan: businessPlan?.toObject() || null,
    financialForecast: financialForecast?.toObject() || null,
    branding: branding?.toObject() || null,
    marketingPlan: marketingPlan?.toObject() || null,
    pitchDeck: pitchDeck?.toObject() || null,
    roadmap: roadmap?.toObject() || null,
    uploadedDocuments: uploadedDocuments?.map(d => d.toObject()) || []
  };
}

export function buildContextString(context: any): string {
  let ctxStr = `--- CURRENT PROJECT CONTEXT ---\n`;
  
  if (context.project) {
    ctxStr += `Project Name: ${context.project.name || 'Untitled'}\n`;
  }

  if (context.selectedOpportunity) {
    ctxStr += `Industry/Opportunity: ${context.selectedOpportunity.title}\n`;
    ctxStr += `Target Audience: ${context.selectedOpportunity.targetAudience || 'General'}\n`;
    ctxStr += `Core Solution: ${context.selectedOpportunity.description}\n`;
  }
  
  if (context.businessPlan) {
    ctxStr += `Business Model: ${context.businessPlan.businessModel}\n`;
    ctxStr += `Unique Value Proposition: ${context.businessPlan.leanCanvas?.uniqueValueProposition || 'N/A'}\n`;
  }
  
  if (context.branding) {
    ctxStr += `Brand Voice: ${context.branding.toneOfVoice}\n`;
    ctxStr += `Brand Slogan: ${context.branding.slogan}\n`;
  }

  if (context.marketingPlan) {
    ctxStr += `Marketing Strategy: ${context.marketingPlan.socialMediaStrategy}\n`;
  }
  
  if (context.financialForecast) {
    ctxStr += `Financial Goal: Target break-even month ${context.financialForecast.breakEvenMonth || 'N/A'}\n`;
    ctxStr += `Pricing Tiers: ${context.financialForecast.pricingTiers?.map((t:any) => t.name).join(', ') || 'N/A'}\n`;
  }

  ctxStr += `-------------------------------\n\n`;
  return ctxStr;
}
