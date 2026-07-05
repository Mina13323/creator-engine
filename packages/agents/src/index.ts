export * from './egyptContext';
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

    console.info(`[Agents] Calling n8n webhook: ${url}`);
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
  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(onboardingData)))) + (contextStr ? '\n\n' + contextStr : '');
  const result = await callN8n<Partial<FounderProfile>>('founder-analysis-flow', {
    projectId,
    data: onboardingData,
    contextStr
  });

  if (result && result.success) {
    return result.data;
  }
  
  console.info('[FounderAgent] n8n unavailable — calling Fireworks LLM directly...');
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
  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(founderProfile)))) + (contextStr ? '\n\n' + contextStr : '');
  const result = await callN8n<BusinessOpportunity[]>('opportunity-discovery-flow', {
    projectId,
    founderProfile,
    contextStr
  });

  if (result && result.success && Array.isArray(result.data)) {
    return result.data;
  }

  console.info('[OpportunityAgent] n8n unavailable — calling Fireworks LLM directly...');
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
  console.info('[OpportunityAgent] raw JSON returned:', rawJson);
  
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
  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(selectedOpportunity)))) + (contextStr ? '\n\n' + contextStr : '');
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

  console.info('[BusinessPlanAgent] n8n unavailable — calling Fireworks LLM directly...');
  const languageInstruction = locale === 'ar' ? 'Output your response in Arabic.' : 'Output your response in English.';
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
    response_format: { type: 'json_object' },
    max_tokens: 8192
  });

  const parsed = parseLLMJson<any>(rawJson);
  if (parsed && parsed.executiveSummary && Object.keys(parsed.executiveSummary).length > 0) {
    parsed.generatedByModel = 'deepseek-v4-flash';
    parsed.generatedAt = new Date();
    return parsed as Partial<BusinessPlan>;
  }

  throw new Error('LLM generated an invalid or empty business plan JSON. Please try again.');
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
  const financialUrl = process.env.FINANCIAL_ENGINE_URL;
  let result: any = null;
  try {
    if (!financialUrl) {
      throw new Error('FINANCIAL_ENGINE_URL is not configured');
    }
    console.info('[FinancialAgent] Calling direct URL:', financialUrl);
    const res = await fetch(financialUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CreatorEngine/1.0'
      },
      body: JSON.stringify({ projectId, businessIdea, businessModel, contextStr }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const json = await res.json();
      result = json?.success ? json : { success: true, data: json };
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (e) {
    console.warn('[FinancialAgent] Direct URL failed, falling back to shared n8n:', e);
    result = await callN8n<any>('financial-engine', { projectId, businessIdea, businessModel, contextStr });
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

  console.info('[FinancialAgent] n8n unavailable — calling Fireworks LLM directly...');
  const systemPrompt = `You are a startup financial modeler for the Egyptian market (values in EGP). Generate a realistic financial projection based on the business idea and model.
Your response MUST be a valid JSON object matching this schema:
{
  "financial": {
    "totalStartupCost": Number,
    "monthlyBurn": Number,
    "breakEvenMonth": Number,
    "startupCosts": [
      { "category": "String", "description": "String", "amount": Number }
    ],
    "monthlyCosts": [
      { "category": "String", "description": "String", "amount": Number, "isVariable": Boolean }
    ],
    "revenueProjections": [
      { "month": Number, "projected_revenue": Number, "cumulative_revenue": Number }
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
        "billingCycle": "monthly | annual | one-time",
        "targetSegment": "String",
        "features": ["String"],
        "justification": "String"
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
    console.error('[FinancialAgent] LLM call failed:', err);
    return null;
  }

  const baseData = parseLLMJson<any>(rawJson);
  if (!baseData) {
    console.error('[FinancialAgent] Failed to parse LLM response. Raw response:', rawJson);
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

  console.warn('[FinancialAgent] Failed to parse LLM JSON, returning default fallback.');
  return {
    financial: {
      totalStartupCost: 150000,
      monthlyBurn: 40000,
      breakEvenMonth: 9,
      startupCosts: [
        { category: "Initial Setup", description: "Basic setup and licenses", amount: 50000 },
        { category: "MVP Development", description: "Core product development", amount: 100000 }
      ],
      monthlyCosts: [
        { category: "Operations", description: "Hosting, tools, salaries", amount: 30000, isVariable: false },
        { category: "Marketing", description: "Ads and outreach", amount: 10000, isVariable: true }
      ],
      revenueProjections: [
        { month: 1, projected_revenue: 5000, cumulative_revenue: 5000 },
        { month: 6, projected_revenue: 40000, cumulative_revenue: 120000 },
        { month: 12, projected_revenue: 100000, cumulative_revenue: 500000 }
      ],
      assumptionsApplied: ["Standard growth in Egyptian market", "Aggressive marketing in first 6 months"]
    },
    pricing: {
      recommendedStrategyType: "Tiered SaaS Pricing",
      marketPositioningRationale: "Designed for small-to-medium enterprises with flexible needs.",
      priceTiers: [
        {
          tierName: "Starter",
          amount: 500,
          billingCycle: "monthly",
          targetSegment: "Small businesses",
          features: ["Basic Access", "Email Support"],
          justification: "Low barrier to entry"
        },
        {
          tierName: "Pro",
          amount: 1500,
          billingCycle: "monthly",
          targetSegment: "Growing startups",
          features: ["Advanced Features", "Priority Support"],
          justification: "Standard market rate for standard needs"
        }
      ]
    }
  };
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
  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(projectContext)))) + (contextStr ? '\n\n' + contextStr : '');
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

  console.info('[Agents] Falling back to direct LLM fetch...');
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
  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(businessPlan)))) + (contextStr ? '\n\n' + contextStr : '');
  const n8nResult = await callN8n<any>('branding-flow', {
    projectId,
    opportunity: selectedOpportunity,
    businessPlan,
    contextStr
  });

  if (n8nResult && n8nResult.success) {
    console.info('[BrandingAgent] n8n workflow succeeded.');
    return n8nResult.data;
  }

  // ── 2. Query RAG for branding context ──────────────────────────────────
  console.info('[BrandingAgent] n8n unavailable — querying RAG and calling LLM directly...');
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
    console.info(`[BrandingAgent] LLM generated brand: "${parsed.brandName}"`);
    return parsed as Partial<BrandIdentity>;
  }

  console.warn('[BrandingAgent] LLM fallback failed or timed out. Returning default fallback.');
  return {
    brandName: selectedOpportunity?.title || "Nova Startup",
    tagline: "Innovating the future.",
    slogan: "Simple, Fast, Reliable.",
    toneOfVoice: "Professional, Modern, and Friendly",
    brandPositioning: "We are positioned as a premium but accessible solution for small to medium enterprises.",
    brandPersonality: ["Innovative", "Trustworthy", "Dynamic"],
    brandStory: "Born out of the need to simplify complex processes, we started this journey to empower businesses.",
    brandVoice: {
      dos: ["Be clear", "Be encouraging", "Be concise"],
      donts: ["Don't use jargon", "Don't be condescending"]
    },
    logoPrompt: "A minimalist, modern vector logo using geometric shapes, flat colors, white background.",
    colorPalette: {
      primary: "#2563EB",
      secondary: "#10B981",
      background: "#FFFFFF",
      accent: "#F59E0B"
    }
  } as Partial<BrandIdentity>;
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
  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(businessPlan)))) + (contextStr ? '\n\n' + contextStr : '');
  const n8nResult = await callN8n<any>('marketing-flow', {
    projectId,
    brandIdentity,
    businessPlan,
    contextStr
  });

  if (n8nResult && n8nResult.success) {
    console.info('[MarketingAgent] n8n workflow succeeded.');
    return n8nResult.data;
  }

  // ── 2. Query RAG for marketing campaign examples ────────────────────────
  console.info('[MarketingAgent] n8n unavailable — querying RAG and calling LLM directly...');
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
    console.info('[MarketingAgent] LLM generated marketing campaign successfully.');
    return parsed as Partial<MarketingCampaign>;
  }

  console.warn('[MarketingAgent] LLM fallback failed or timed out. Returning default fallback.');
  return {
    marketingPlan: "A comprehensive 3-month go-to-market strategy focusing on digital acquisition.",
    launchPlan: "Month 1: Teaser & Pre-launch. Month 2: Official Launch. Month 3: Scaling & Optimization.",
    campaigns: [
      {
        name: "Awareness Blast",
        platform: "Facebook/Instagram",
        budget: 5000,
        goal: "Brand Awareness",
        duration: "4 weeks",
        tactics: ["Video ads", "Carousel ads"]
      }
    ],
    targetChannels: ["Social Media", "Email Marketing", "SEO"],
    budgetAllocation: {
      "Social Media Ads": 5000,
      "Content Creation": 2000,
      "Email Marketing": 1000
    },
    adCopies: [
      {
        platform: "Instagram",
        headline: "Simplify Your Work Today",
        body: "Join thousands of businesses saving time.",
        callToAction: "Sign Up Now"
      }
    ],
    contentHooks: ["Tired of manual work?", "The secret to 10x growth"],
    socialMediaStrategy: "Post 3 times a week with educational content and case studies."
  } as Partial<MarketingCampaign>;
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
  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(businessPlan)))) + (contextStr ? '\n\n' + contextStr : '');
  const n8nResult = await callN8n<any>('pitch-flow', {
    projectId,
    businessPlan,
    brandIdentity,
    contextStr
  });

  if (n8nResult && n8nResult.success) {
    console.info('[PitchAgent] n8n workflow succeeded.');
    return n8nResult.data;
  }

  // ── 2. Query RAG for pitch deck examples ───────────────────────────────
  console.info('[PitchAgent] n8n unavailable — querying RAG and calling LLM directly...');
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
    console.info('[PitchAgent] LLM generated pitch deck successfully.');
    return parsed as Partial<PitchDeck>;
  }

  console.warn('[PitchAgent] LLM fallback failed or timed out. Returning default fallback.');
  return {
    startupPitch: "We are revolutionizing the industry with our innovative solution.",
    investorSummary: "A high-growth opportunity addressing a critical market gap.",
    elevatorPitch: "For businesses struggling with inefficiency, we provide a streamlined platform that saves time and money.",
    problemStatement: "Current tools are too complex and expensive.",
    solution: "A simple, cost-effective SaaS platform.",
    keyMetrics: {
      marketSize: "$10B+ TAM",
      revenueModel: "Monthly SaaS Subscription",
      targetCustomers: "SMEs and Startups",
      uniqueAdvantage: "AI-driven automation and seamless UX.",
      fundingAsk: "$500,000 for product development and marketing."
    },
    traction: "Early beta users show 40% increased productivity."
  } as Partial<PitchDeck>;
}

export * from './marketingStudioAgent';
export * from './media/storageProvider';
export * from './evaluatorAgent';
export * from './executionAgent';
export * from './nextActionAgent';
