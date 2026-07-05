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
  UploadedDocumentModel,
  AIEvaluationModel 
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
    evaluations,
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
    ExecutionRoadmapModel.findOne({ projectId, userId }),
    AIEvaluationModel.find({ projectId, userId }),
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
    evaluations: evaluations?.map((e: any) => e.toObject()) || [],
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

  if (context.uploadedDocuments && context.uploadedDocuments.length > 0) {
    ctxStr += `\n--- UPLOADED DOCUMENTS ---\n`;
    context.uploadedDocuments.forEach((doc: any, i: number) => {
      ctxStr += `\n[Document ${i + 1}: ${doc.title || doc.filename}]\n`;
      if (doc.summary) ctxStr += `Summary: ${doc.summary}\n`;
      if (doc.extractedText) {
        ctxStr += `Content Snapshot:\n${doc.extractedText.substring(0, 1000)}${doc.extractedText.length > 1000 ? '...' : ''}\n`;
      }
    });
  }

  
  if (context.roadmap) {
    ctxStr += '\n--- EXECUTION ROADMAP ---\n';
    ctxStr += `Progress: ${context.roadmap.progress}%\n`;
    context.roadmap.phases?.forEach((p: any) => {
      ctxStr += `Phase: ${p.name}\n`;
      const pendingTasks = p.tasks?.filter((t: any) => t.status !== 'done') || [];
      if (pendingTasks.length > 0) {
        ctxStr += `Incomplete Tasks:\n`;
        pendingTasks.forEach((t: any) => {
          ctxStr += ` - ${t.title} (Priority: ${t.priority})\n`;
        });
      }
    });
  }

  if (context.evaluations && context.evaluations.length > 0) {
    ctxStr += '\n--- AI QUALITY EVALUATIONS ---\n';
    context.evaluations.forEach((ev: any) => {
      ctxStr += `Type: ${ev.targetType} | Score: ${ev.overallScore}/100\n`;
      if (ev.recommendations?.length > 0) {
        ctxStr += `Recommendations: ${ev.recommendations.join(', ')}\n`;
      }
    });
  }

  ctxStr += `-------------------------------\n\n`;
  return ctxStr;
}
