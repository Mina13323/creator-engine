import {
  FounderProfile,
  BusinessOpportunity,
  BusinessPlan,
  N8nWebhookResponse
} from '@creator/types';

// Helper to call n8n webhooks
async function callN8n<T>(workflowPath: string, payload: any): Promise<N8nWebhookResponse<T> | null> {
  const n8nUrl = process.env.N8N_API_URL || 'http://localhost:5678';
  const token = process.env.N8N_TOKEN;
  
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

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }
    
    // We expect n8n to return structured JSON
    const data: N8nWebhookResponse<T> = await response.json();
    return data;
  } catch (e) {
    console.warn(`[Agents] N8n webhook ${workflowPath} failed:`, e);
    return null;
  }
}

// ==========================================
// NEW AGENT RUNNERS (Business Plan Engine)
// ==========================================

export async function runFounderAgent(
  projectId: string,
  onboardingData: any
): Promise<Partial<FounderProfile> | null> {
  const result = await callN8n<Partial<FounderProfile>>('founder-analysis-flow', {
    projectId,
    data: onboardingData
  });

  if (result && result.success) {
    return result.data;
  }
  
  // Fallback for local development without n8n
  return {
    founderType: 'Visionary Hustler',
    strengths: ['Sales', 'Pitching', 'Domain Expertise'],
    weaknesses: ['Technical Execution', 'Financial Modeling'],
    recommendedBusinessModels: ['B2B SaaS', 'Marketplace'],
    recommendedStartupTypes: ['Tech-Enabled Service']
  };
}

export async function runOpportunityAgent(
  projectId: string,
  founderProfile: FounderProfile
): Promise<BusinessOpportunity[] | null> {
  const result = await callN8n<BusinessOpportunity[]>('opportunity-discovery-flow', {
    projectId,
    founderProfile
  });

  if (result && result.success && Array.isArray(result.data)) {
    return result.data;
  }

  // Fallback for local development
  return [
    {
      id: `opp_${Date.now()}_1`,
      userId: founderProfile.userId,
      projectId,
      title: 'AI-Powered Local Services Marketplace',
      description: 'Connect local freelancers with SMEs using AI matching and automated escrow.',
      opportunityScore: 92,
      founderFitScore: 88,
      marketDemandScore: 95,
      aiAdvantageScore: 90,
      difficulty: 'Medium',
      startupCost: '$5k - $10k',
      estimatedRevenue: '$10k/mo MRR',
      timeToMVP: '4 Weeks'
    },
    {
      id: `opp_${Date.now()}_2`,
      userId: founderProfile.userId,
      projectId,
      title: 'B2B Workflow Automation Agency',
      description: 'Build n8n and AI workflows for traditional non-tech businesses in your local area.',
      opportunityScore: 85,
      founderFitScore: 95,
      marketDemandScore: 80,
      aiAdvantageScore: 95,
      difficulty: 'Low',
      startupCost: '$1k',
      estimatedRevenue: '$15k/mo Service',
      timeToMVP: '1 Week'
    }
  ];
}

export async function runBusinessPlanAgent(
  projectId: string,
  selectedOpportunity: any,
  founderProfile: any
): Promise<Partial<BusinessPlan> | null> {
  const result = await callN8n<Partial<BusinessPlan>>('business-plan-flow', {
    projectId,
    opportunity: selectedOpportunity,
    founderProfile
  });

  if (result && result.success) {
    return result.data;
  }

  // Fallback
  return {
    executiveSummary: 'A platform bridging the gap between local talent and SME needs.',
    problemStatement: 'SMEs struggle to find reliable local freelancers, and freelancers lack consistent deal flow.',
    solution: 'An AI-matched marketplace ensuring quality and escrow payments.',
    targetAudience: 'Local small and medium enterprises (SMEs) looking for verified project talent, and skilled local freelancers.',
    marketOpportunity: 'The MENA gig economy is growing at 22% CAGR.',
    leanCanvas: {
      problem: ['Unreliable freelancers', 'Payment disputes'],
      solution: ['AI matching', 'Escrow protection'],
      keyMetrics: ['GMV', 'Active users'],
      uniqueValueProposition: 'The only hyper-local AI matched marketplace with guaranteed escrow.',
      unfairAdvantage: 'First-mover advantage with AI matching in the local region.',
      channels: ['LinkedIn outreach', 'Local SME communities'],
      customerSegments: ['Local SMEs', 'Tech freelancers'],
      costStructure: ['Hosting', 'Marketing'],
      revenueStreams: ['10% platform fee']
    },
    customerSegments: ['SMEs', 'Freelancers'],
    businessModel: 'Transaction Fee',
    revenueModel: 'Transaction Fee',
    pricingStrategy: '10% on successful project completion',
    goToMarketStrategy: 'Direct sales to top 50 local SMEs to build initial demand.',
    mvpScope: ['Basic user profiles', 'Hyper-local AI matchmaking', 'Job posting workflow', 'Stripe escrow integration'],
    successMetrics: ['100 active jobs', '$10k GMV first month'],
    growthStrategy: 'Referral program offering $50 credit for successful hires.',
    marketResearchSummary: 'Tavily research highlights high demand for verified talent in the MENA region with 22% CAGR.',
    generatedByModel: 'deepseek-v4-flash',
    generatedAt: new Date()
  };
}

export async function runCofounderAgent(
  message: string,
  projectContext: string,
  chatHistory: any[]
): Promise<any> {
  const result = await callN8n<any>('cofounder-chat-flow', {
    message,
    state: projectContext,
    history: chatHistory
  });

  if (result && result.success) {
    return {
      id: `msg_ai_${Date.now()}`,
      sender: 'ai',
      message: result.data || result.data.message || 'Error parsing response',
      timestamp: new Date()
    };
  }

  return {
    id: `msg_ai_${Date.now()}`,
    sender: 'ai',
    message: "I am your AI Cofounder. I'm currently running in local fallback mode.",
    timestamp: new Date()
  };
}
