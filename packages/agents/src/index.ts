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
import { AgentRunModel } from '@creator/database';
export * from './aiClient';
import { callLLMWithFallback, callFireworksChat, parseLLMJson } from './aiClient';

// =========================================================================
// HELPER: Call n8n Webhook
// =========================================================================
async function callN8n<T>(workflowPath: string, payload: any): Promise<N8nWebhookResponse<T> | null> {
  const n8nUrl = process.env.N8N_API_URL;
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
  contextStr: string = '',
  locale: string = 'en'
): Promise<Partial<BusinessPlan> | null> {
  const result = await callN8n<Partial<BusinessPlan>>('business-plan-flow', {
    projectId,
    opportunity: selectedOpportunity,
    founderProfile,
    contextStr,
    locale
  });

  if (result && result.success) {
    return result.data;
  }

  console.log('[BusinessPlanAgent] n8n unavailable — calling Fireworks LLM directly...');
  const languageInstruction = locale === 'ar'
    ? 'IMPORTANT: All textual values (descriptions, startup name, mission, vision, reasoning, target points, pricing strategy, etc.) in the JSON object MUST be written in the Arabic language. Keep the JSON keys in English, but all string values must be standard Arabic.'
    : 'Generate all content in English.';

  const systemPrompt = `You are a strategic Business Plan Generator. Generate a comprehensive business plan based on the selected opportunity and founder profile.
${languageInstruction}
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
  console.log(`[FinancialAgent] Running native agent for project ${projectId}...`);

  const startedAt = new Date();
  const inputData = { businessIdea, businessModel };
  
  // Initialize run tracking log (telemetry auditing for admin dashboard)
  let runDoc: any = null;
  try {
    runDoc = new AgentRunModel({
      id: `run_${Date.now()}_fin`,
      userId: 'system', // Default user id context for background runs
      projectId,
      workflow: 'financial-engine',
      status: 'pending',
      aiModel: 'deepseek-v4-flash',
      provider: 'fireworks',
      startedAt,
      input: inputData
    });
    await runDoc.save();
  } catch (dbErr) {
    console.warn('[FinancialAgent] Failed to create AgentRun record:', dbErr);
  }

  // 1. Retrieve Egyptian market/pricing context via MongoDB vector search (RAG)
  let ragContext = contextStr;
  try {
    const searchPrompt = `${businessIdea} ${businessModel} Egyptian market pricing costs`;
    console.log('[FinancialAgent] Fetching RAG documents for query:', searchPrompt);
    const ragDocs = await queryRAG(searchPrompt, 3);
    const formattedDocs = ragDocs.map((doc: any) => `[${doc.title}]\n${doc.content}`).join('\n\n');
    
    if (formattedDocs) {
      ragContext = ragContext 
        ? `${ragContext}\n\nLocal Market Context:\n${formattedDocs}`
        : formattedDocs;
    }
  } catch (err) {
    console.warn('[FinancialAgent] RAG query failed, proceeding with fallback content:', err);
  }

  // 2. Query the LLM to get the base financial structures
  const systemPrompt = `You are a startup financial modeler for the Egyptian market (values in EGP). Generate a realistic financial projection based on the business idea and model.
Your response MUST be a valid JSON object matching this schema:
{
  "startupCosts": [
    { "category": "String", "description": "String", "amount": Number }
  ],
  "monthlyFixedCosts": [
    { "category": "String", "description": "String", "amount": Number }
  ],
  "initialMonthlyRevenue": Number,
  "assumptionsApplied": ["String"],
  "pricing": {
    "recommendedStrategyType": "String",
    "marketPositioningRationale": "String",
    "priceTiers": [
      {
        "tierName": "String",
        "amount": Number,
        "billingCycle": "String (must be 'monthly', 'annual', or 'one-time')",
        "targetSegment": "String",
        "features": ["String"]
      }
    ]
  }
}
Output ONLY the JSON object. Do not wrap in markdown formatting blocks or include conversational text.`;

  const userPrompt = `Business Idea: ${businessIdea}
Business Model: ${businessModel}
${ragContext ? '\nContext:\n' + ragContext : ''}`;

  let rawJson: string | null = null;
  try {
    console.log('[FinancialAgent] Calling LLM...');
    rawJson = await callFireworksChat(systemPrompt, userPrompt, {
      model: 'accounts/fireworks/models/deepseek-v4-flash',
      response_format: { type: 'json_object' }
    });

    if (!rawJson) {
      console.warn('[FinancialAgent] Primary Fireworks model (deepseek-v4-flash) failed. Trying fallback...');
      rawJson = await callLLMWithFallback(systemPrompt, userPrompt, {
        response_format: { type: 'json_object' }
      });
    }

    if (!rawJson) {
      throw new Error('All LLM endpoints returned empty response');
    }
  } catch (err: any) {
    if (runDoc) {
      try {
        const completedAt = new Date();
        const inputStr = JSON.stringify(inputData);
        const promptTokens = Math.max(50, Math.ceil(inputStr.length / 4.1));
        runDoc.status = 'failed';
        runDoc.completedAt = completedAt;
        runDoc.durationMs = completedAt.getTime() - startedAt.getTime();
        runDoc.error = err.message;
        runDoc.promptTokens = promptTokens;
        runDoc.totalTokens = promptTokens;
        await runDoc.save();
      } catch (saveErr) {
        console.warn('[FinancialAgent] Failed to update failed AgentRun record:', saveErr);
      }
    }
    return null;
  }

  const baseData = parseLLMJson<any>(rawJson);
  if (!baseData) {
    console.error('[FinancialAgent] Failed to parse LLM response. Raw response:', rawJson);
    if (runDoc) {
      try {
        const completedAt = new Date();
        const inputStr = JSON.stringify(inputData);
        const promptTokens = Math.max(50, Math.ceil(inputStr.length / 4.1));
        runDoc.status = 'failed';
        runDoc.completedAt = completedAt;
        runDoc.durationMs = completedAt.getTime() - startedAt.getTime();
        runDoc.error = 'Failed to parse LLM response as JSON';
        runDoc.promptTokens = promptTokens;
        runDoc.totalTokens = promptTokens;
        await runDoc.save();
      } catch (saveErr) {
        console.warn('[FinancialAgent] Failed to update parse-failure AgentRun record:', saveErr);
      }
    }
    return null;
  }

  // 3. Deterministic Mathematical Calculations (mirroring the n8n JS node)
  const M_O_M_GROWTH_RATE = 1.15;

  let totalStartupCost = 0;
  (baseData.startupCosts || []).forEach((item: any) => {
    totalStartupCost += (item.amount || 0);
  });

  let monthlyBurn = 0;
  (baseData.monthlyFixedCosts || []).forEach((item: any) => {
    monthlyBurn += (item.amount || 0);
  });

  // Generate 12 Month Projections
  const revenueProjections = [];
  let cumulativeRevenue = 0;
  let breakEvenMonth: number | string | null = null;
  let currentRevenue = baseData.initialMonthlyRevenue || 2000;

  for (let m = 1; m <= 12; m++) {
    cumulativeRevenue += currentRevenue;

    if (!breakEvenMonth && cumulativeRevenue >= (totalStartupCost + (monthlyBurn * m))) {
      breakEvenMonth = m;
    }

    revenueProjections.push({
      month: m,
      projected_revenue: Math.round(currentRevenue),
      cumulative_revenue: Math.round(cumulativeRevenue)
    });

    currentRevenue = currentRevenue * M_O_M_GROWTH_RATE;
  }

  // 4. Construct Final Payload
  const finalOutput = {
    financial: {
      totalStartupCost: Math.round(totalStartupCost),
      monthlyBurn: Math.round(monthlyBurn),
      startupCosts: baseData.startupCosts || [],
      monthlyCosts: baseData.monthlyFixedCosts || [],
      revenueProjections: revenueProjections,
      breakEvenMonth: breakEvenMonth || "12+",
      assumptionsApplied: baseData.assumptionsApplied || []
    },
    pricing: baseData.pricing || {}
  };

  // Update success status and calculate token usage
  if (runDoc) {
    try {
      const completedAt = new Date();
      const inputStr = JSON.stringify(inputData);
      const outputStr = JSON.stringify(finalOutput);
      const promptTokens = Math.max(50, Math.ceil(inputStr.length / 4.1));
      const completionTokens = Math.max(50, Math.ceil(outputStr.length / 4.1));
      
      runDoc.status = 'success';
      runDoc.completedAt = completedAt;
      runDoc.durationMs = completedAt.getTime() - startedAt.getTime();
      runDoc.output = finalOutput;
      runDoc.promptTokens = promptTokens;
      runDoc.completionTokens = completionTokens;
      runDoc.totalTokens = promptTokens + completionTokens;
      await runDoc.save();
    } catch (saveErr) {
      console.warn('[FinancialAgent] Failed to update success AgentRun record:', saveErr);
    }
  }

  console.log('[FinancialAgent] Successfully calculated projections. Break-even month:', finalOutput.financial.breakEvenMonth);
  return finalOutput;
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
