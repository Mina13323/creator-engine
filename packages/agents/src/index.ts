import {
  FounderProfile,
  BusinessOpportunity,
  BusinessPlan,
  N8nWebhookResponse,
  BrandIdentity,
  SelectedOpportunity,
  MarketingCampaign,
  PitchDeck
} from '@creator/types';
import { queryRAG } from '@creator/rag-core';
import { AGENT_PROMPTS } from '@creator/prompts';
export * from './aiClient';
import { callLLMWithFallback, callFireworksChat, parseLLMJson } from './aiClient';

// =========================================================================
// HELPER: Call n8n Webhook
// =========================================================================
async function callN8n<T>(workflowPath: string, payload: any): Promise<N8nWebhookResponse<T> | null> {
  const n8nUrl = process.env.N8N_API_URL || 'http://localhost:5678';
  const token = process.env.N8N_TOKEN;
  const startTime = Date.now();
  
  try {
    const url = `${n8nUrl}/webhook/${workflowPath}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token && token !== 'your-n8n-token-if-applicable') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[Agents] Calling n8n webhook: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      console.error(JSON.stringify({
        event: 'WORKFLOW_EXECUTION',
        workflow: workflowPath,
        status: 'FAILED',
        durationMs,
        error: `HTTP ${response.status}`
      }));
      throw new Error(`n8n responded with status ${response.status}`);
    }
    
    const data: N8nWebhookResponse<T> = await response.json();
    
    console.info(JSON.stringify({
      event: 'WORKFLOW_EXECUTION',
      workflow: workflowPath,
      status: data.success ? 'SUCCESS' : 'FAILED',
      durationMs,
      error: data.error || null
    }));
    
    return data;
  } catch (e: any) {
    const durationMs = Date.now() - startTime;
    console.error(JSON.stringify({
      event: 'WORKFLOW_EXECUTION',
      workflow: workflowPath,
      status: 'FAILED',
      durationMs,
      error: e.message
    }));
    console.warn(`[Agents] N8n webhook ${workflowPath} failed:`, e);
    return null;
  }
}

// =========================================================================
// HELPER: AI Client methods now imported from aiClient.ts
// =========================================================================

// ==========================================
// FOUNDER AGENT
// ==========================================

export async function runFounderAgent(
  projectId: string,
  onboardingData: any,
  contextStr: string = ''
): Promise<Partial<FounderProfile> | null> {
  const result = await callN8n<Partial<FounderProfile>>('founder-analysis-flow', {
    projectId,
    data: onboardingData,
    contextStr
  });

  if (result && result.success) {
    return result.data;
  }
  
  console.log('[FounderAgent] n8n unavailable — calling Fireworks LLM directly...');
  const systemPrompt = `You are an expert startup founder analyst. Output ONLY valid JSON matching this schema:
{
  "founderType": "String",
  "strengths": ["String", "String"],
  "weaknesses": ["String", "String"],
  "recommendedBusinessModels": ["String", "String"],
  "recommendedStartupTypes": ["String", "String"]
}
${contextStr ? '\nProject Context:\n' + contextStr : ''}`;
  const userPrompt = `Analyze this onboarding data and return the founder profile JSON: ${JSON.stringify(onboardingData)}`;
  
  const rawJson = await callFireworksChat(systemPrompt, userPrompt, {
    model: 'accounts/fireworks/models/deepseek-v4-flash',
    response_format: { type: 'json_object' }
  });

  const parsed = parseLLMJson<any>(rawJson);
  if (parsed) return parsed as Partial<FounderProfile>;

  return null;
}

// ==========================================
// OPPORTUNITY AGENT
// ==========================================

export async function runOpportunityAgent(
  projectId: string,
  founderProfile: FounderProfile,
  contextStr: string = ''
): Promise<BusinessOpportunity[] | null> {
  const result = await callN8n<BusinessOpportunity[]>('opportunity-discovery-flow', {
    projectId,
    founderProfile,
    contextStr
  });

  if (result && result.success && Array.isArray(result.data)) {
    return result.data;
  }

  console.log('[OpportunityAgent] n8n unavailable — calling Fireworks LLM directly...');
  const systemPrompt = `You are an expert startup opportunity generator. Based on the founder's profile, generate 2-3 tailored business opportunities.
Output ONLY a JSON object containing an "opportunities" array. Example schema:
{
  "opportunities": [
    {
      "id": "opp_1",
      "title": "String",
      "description": "String",
      "opportunityScore": Number (0-100),
      "founderFitScore": Number (0-100),
      "marketDemandScore": Number (0-100),
      "aiAdvantageScore": Number (0-100),
      "difficulty": "Low|Medium|High",
      "startupCost": "String",
      "estimatedRevenue": "String",
      "timeToMVP": "String"
    }
  ]
}
${contextStr ? '\nProject Context:\n' + contextStr : ''}`;
  const userPrompt = `Founder Profile: ${JSON.stringify(founderProfile)}\nGenerate opportunities.`;

  const rawJson = await callFireworksChat(systemPrompt, userPrompt, {
    model: 'accounts/fireworks/models/deepseek-v4-flash',
    response_format: { type: 'json_object' }
  });

  const parsed = parseLLMJson<any>(rawJson);
  console.log('[OpportunityAgent] raw JSON returned:', rawJson);
  
  if (parsed) {
    // If wrapped in an object like { "opportunities": [...] }
    if (Array.isArray(parsed)) return parsed as BusinessOpportunity[];
    if (parsed.opportunities && Array.isArray(parsed.opportunities)) return parsed.opportunities as BusinessOpportunity[];
    
    // Attempt to return the parsed object as array if possible
    const values = Object.values(parsed);
    const arrayItem = values.find(v => Array.isArray(v));
    if (arrayItem) return arrayItem as BusinessOpportunity[];
  }

  return null;
}

// ==========================================
// BUSINESS PLAN AGENT
// ==========================================

export async function runBusinessPlanAgent(
  projectId: string,
  selectedOpportunity: any,
  founderProfile: any,
  contextStr: string = ''
): Promise<Partial<BusinessPlan> | null> {
  const result = await callN8n<Partial<BusinessPlan>>('business-plan-flow', {
    projectId,
    opportunity: selectedOpportunity,
    founderProfile,
    contextStr
  });

  if (result && result.success) {
    return result.data;
  }

  console.log('[BusinessPlanAgent] n8n unavailable — calling Fireworks LLM directly...');
  const systemPrompt = `You are a strategic Business Plan Generator. Generate a comprehensive business plan based on the selected opportunity and founder profile.
Output ONLY a JSON object.
${contextStr ? '\nProject Context:\n' + contextStr : ''}`;
  
  const userPrompt = `Opportunity: ${JSON.stringify(selectedOpportunity)}\nFounder: ${JSON.stringify(founderProfile)}\nGenerate business plan JSON matching the schema.
{
  "executiveSummary": {
    "startupName": "String",
    "mission": "String",
    "vision": "String",
    "valueProposition": "String",
    "executiveSummary": "String",
    "strategicPositioning": "String"
  },
  "problemAndSolution": {
    "problem": "String",
    "solution": "String",
    "targetPainPoints": ["String"],
    "customerNeeds": ["String"],
    "uniqueAdvantages": ["String"],
    "unfairAdvantage": "String"
  },
  "businessModel": {
    "revenueStreams": ["String"],
    "pricingStrategy": "String",
    "acquisitionModel": "String",
    "salesModel": "String",
    "distributionChannels": ["String"],
    "partnerships": ["String"],
    "subscriptions": ["String"]
  },
  "viabilityAnalysis": {
    "marketOpportunityScore": 85,
    "founderFitScore": 90,
    "profitabilityScore": 80,
    "scalabilityScore": 88,
    "executionScore": 82,
    "overallScore": 85,
    "reasoning": "String"
  },
  "marketResearch": {
    "marketSize": "String",
    "industryGrowthRate": "String",
    "trends": ["String"],
    "competitors": [{"name": "String", "strengths": "String", "weaknesses": "String"}],
    "marketGaps": ["String"],
    "targetSegments": ["String"],
    "customerBehavior": "String"
  },
  "productsAndServices": {
    "coreOfferings": ["String"],
    "premiumOfferings": ["String"],
    "supportServices": ["String"],
    "futureExpansionOpportunities": ["String"]
  },
  "salesAndMarketing": {
    "acquisitionChannels": ["String"],
    "marketingFunnel": { "awareness": "String", "interest": "String", "consideration": "String", "purchase": "String", "retention": "String" },
    "customerRetention": "String",
    "onlinePresence": "String",
    "contentStrategy": "String",
    "growthStrategy": "String"
  },
  "financialInsights": {
    "revenueProjection": "string",
    "monthlyGrowth": "string",
    "breakEvenPoint": "string",
    "profitabilityTimeline": "string",
    "unitEconomics": "string",
    "keyRisks": ["string"],
    "chartData": [
      { "month": "Month 1", "revenue": 0, "cost": 0 }
    ]
  },
  "swotAnalysis": {
    "strengths": ["String"],
    "weaknesses": ["String"],
    "opportunities": ["String"],
    "threats": ["String"]
  },
  "riskAssessment": {
    "marketRisks": ["String"],
    "operationalRisks": ["String"],
    "technicalRisks": ["String"],
    "financialRisks": ["String"],
    "mitigationStrategies": ["String"]
  }
}`;

  const rawJson = await callFireworksChat(systemPrompt, userPrompt, {
    model: 'accounts/fireworks/models/deepseek-v4-flash',
    response_format: { type: 'json_object' }
  });

  const parsed = parseLLMJson<any>(rawJson);
  if (parsed) {
    parsed.generatedByModel = 'deepseek-v4-flash';
    parsed.generatedAt = new Date();
    return parsed as Partial<BusinessPlan>;
  }

  return null;
}

// ==========================================
// FINANCIAL AGENT
// ==========================================

export async function runFinancialAgent(
  projectId: string,
  businessIdea: string,
  businessModel: string,
  contextStr: string = ''
): Promise<any | null> {
  const result = await callN8n<any>('financial-engine', {
    projectId,
    businessIdea,
    businessModel,
    contextStr
  });

  if (result && result.success) {
    return result.data;
  }

  console.log('[FinancialAgent] n8n unavailable — calling Fireworks LLM directly...');
  const systemPrompt = `You are a startup financial modeler for the Egyptian market (values in EGP). Generate a realistic financial projection based on the business idea and model.
Output ONLY a JSON object matching this exact schema:
{
  "financial": {
    "totalStartupCost": Number,
    "monthlyBurn": Number,
    "breakEvenMonth": Number,
    "startupCosts": [
      { "category": "String", "description": "String", "amount": Number }
    ],
    "monthlyCosts": [
      { "category": "String", "description": "String", "amount": Number }
    ],
    "assumptionsApplied": ["String"]
  },
  "pricing": {
    "recommendedStrategyType": "String",
    "marketPositioningRationale": "String",
    "priceTiers": [
      {
        "tierName": "String",
        "amount": Number,
        "billingCycle": "String (e.g. mo, yr)",
        "targetSegment": "String",
        "features": ["String"]
      }
    ]
  }
}
${contextStr ? '\nProject Context:\n' + contextStr : ''}`;
  const userPrompt = `Idea: ${businessIdea}\nModel: ${businessModel}\nGenerate financial forecast.`;

  const rawJson = await callFireworksChat(systemPrompt, userPrompt, {
    model: 'accounts/fireworks/models/deepseek-v4-flash',
    response_format: { type: 'json_object' }
  });

  const parsed = parseLLMJson<any>(rawJson);
  if (parsed) return parsed;

  return null;
}

// ==========================================
// COFOUNDER CHAT AGENT
// ==========================================

export async function runCofounderAgent(
  message: string,
  projectContext: any,
  contextStr: string = ''
): Promise<any> {
  const projectId = projectContext?.id || projectContext?.projectId;
  const n8nResult = await callN8n<any>('cofounder-chat-flow', {
    message,
    projectContext,
    contextStr
  });

  if (n8nResult && n8nResult.success) {
    return {
      id: `msg_ai_${Date.now()}`,
      sender: 'ai',
      message: n8nResult.data || 'Error parsing response',
      timestamp: new Date()
    };
  }

  const ragDocs = await queryRAG(message, 3);
  const ragContext = ragDocs.map((doc: any) => `[${doc.title}]\n${doc.content}`).join('\n\n');

  console.log('[Agents] Falling back to direct LLM fetch...');
  const systemPrompt = `You are the Principal AI Consultant and Cofounder. You are actively building the user's startup. 
Use the following context to provide tailored advice.

${contextStr}

Use the following external research if relevant:
${ragContext}`;

  const userPrompt = `User: ${message}`;
  
  try {
    const responseText = await callFireworksChat(
      systemPrompt,
      userPrompt,
      { response_format: null, model: 'accounts/fireworks/models/deepseek-v4-flash' }
    );
    if (responseText) {
      return {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        message: responseText,
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.error('[Agents] Fallback fetch failed:', error);
  }

  return null;
}

// ==========================================
// BRANDING AGENT
// ==========================================

export async function runBrandingAgent(
  projectId: string,
  selectedOpportunity: SelectedOpportunity | any,
  businessPlan: BusinessPlan | any,
  contextStr: string = ''
): Promise<Partial<BrandIdentity> | null> {

  // ── 1. Try n8n workflow first ───────────────────────────────────────────
  const n8nResult = await callN8n<any>('branding-flow', {
    projectId,
    opportunity: selectedOpportunity,
    businessPlan,
    contextStr
  });

  if (n8nResult && n8nResult.success) {
    console.log('[BrandingAgent] n8n workflow succeeded.');
    return n8nResult.data;
  }

  // ── 2. Query RAG for branding context ──────────────────────────────────
  console.log('[BrandingAgent] n8n unavailable — querying RAG and calling LLM directly...');
  const ragDocs = await queryRAG('branding case studies brand identity brand story', 4);
  const ragContext = ragDocs
    .map((doc: any) => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // ── 3. Call Gemini (or Fireworks fallback) ──────────────────────────────
  const prompt = AGENT_PROMPTS.BRANDING_AGENT;
  const systemPrompt = `${prompt.system}\n\n${contextStr ? 'Project Context:\n' + contextStr : ''}`;
  
  const rawJson = await callLLMWithFallback(
    systemPrompt,
    prompt.user(
      selectedOpportunity?.title || businessPlan?.executiveSummary || 'Innovative Startup',
      businessPlan?.solution || selectedOpportunity?.description || '',
      businessPlan?.leanCanvas?.uniqueValueProposition || '',
      ragContext
    )
  );

  const parsed = parseLLMJson<any>(rawJson);
  if (parsed && parsed.brandName) {
    console.log(`[BrandingAgent] LLM generated brand: "${parsed.brandName}"`);
    return parsed as Partial<BrandIdentity>;
  }

  console.error('[BrandingAgent] LLM fallback failed.');
  return null;
}

// ==========================================
// MARKETING AGENT
// ==========================================

export async function runMarketingAgent(
  projectId: string,
  brandIdentity: BrandIdentity | any,
  businessPlan: BusinessPlan | any,
  contextStr: string = ''
): Promise<Partial<MarketingCampaign> | null> {

  // ── 1. Try n8n workflow first (includes Tavily search) ─────────────────
  const n8nResult = await callN8n<any>('marketing-flow', {
    projectId,
    brandIdentity,
    businessPlan,
    contextStr
  });

  if (n8nResult && n8nResult.success) {
    console.log('[MarketingAgent] n8n workflow succeeded.');
    return n8nResult.data;
  }

  // ── 2. Query RAG for marketing campaign examples ────────────────────────
  console.log('[MarketingAgent] n8n unavailable — querying RAG and calling LLM directly...');
  const ragDocs = await queryRAG(
    'marketing campaign launch strategy social media Instagram WhatsApp B2B outreach',
    4
  );
  const ragContext = ragDocs
    .map((doc: any) => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // ── 3. Call Gemini (or Fireworks fallback) ──────────────────────────────
  const prompt = AGENT_PROMPTS.MARKETING_AGENT;
  const systemPrompt = `${prompt.system}\n\n${contextStr ? 'Project Context:\n' + contextStr : ''}`;
  
  const rawJson = await callLLMWithFallback(
    systemPrompt,
    prompt.user(
      brandIdentity?.brandName || 'Our Brand',
      brandIdentity?.slogan || '',
      businessPlan?.solution || '',
      businessPlan?.customerSegments || [],
      ragContext
    )
  );

  const parsed = parseLLMJson<any>(rawJson);
  if (parsed && parsed.marketingPlan) {
    console.log('[MarketingAgent] LLM generated marketing campaign successfully.');
    return parsed as Partial<MarketingCampaign>;
  }

  console.error('[MarketingAgent] LLM fallback failed.');
  return null;
}

// ==========================================
// PITCH AGENT
// ==========================================

export async function runPitchAgent(
  projectId: string,
  businessPlan: BusinessPlan | any,
  brandIdentity: BrandIdentity | any,
  contextStr: string = ''
): Promise<Partial<PitchDeck> | null> {

  // ── 1. Try n8n workflow first ───────────────────────────────────────────
  const n8nResult = await callN8n<any>('pitch-flow', {
    projectId,
    businessPlan,
    brandIdentity,
    contextStr
  });

  if (n8nResult && n8nResult.success) {
    console.log('[PitchAgent] n8n workflow succeeded.');
    return n8nResult.data;
  }

  // ── 2. Query RAG for pitch deck examples ───────────────────────────────
  console.log('[PitchAgent] n8n unavailable — querying RAG and calling LLM directly...');
  const ragDocs = await queryRAG(
    'startup pitch deck investor summary elevator pitch narrative arc funding',
    4
  );
  const ragContext = ragDocs
    .map((doc: any) => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // ── 3. Call Gemini (or Fireworks fallback) ──────────────────────────────
  const prompt = AGENT_PROMPTS.PITCH_AGENT;
  const systemPrompt = `${prompt.system}\n\n${contextStr ? 'Project Context:\n' + contextStr : ''}`;
  
  const rawJson = await callLLMWithFallback(
    systemPrompt,
    prompt.user(
      brandIdentity?.brandName || 'Our Venture',
      businessPlan?.solution || businessPlan?.executiveSummary || '',
      businessPlan?.goToMarketStrategy || '',
      businessPlan?.marketOpportunity || '',
      ragContext
    )
  );

  const parsed = parseLLMJson<any>(rawJson);
  if (parsed && parsed.startupPitch) {
    console.log('[PitchAgent] LLM generated pitch deck successfully.');
    return parsed as Partial<PitchDeck>;
  }

  console.error('[PitchAgent] LLM fallback failed.');
  return null;
}

export * from './marketingStudioAgent';
export * from './media/storageProvider';
