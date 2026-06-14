import { GoogleGenerativeAI } from '@google/generative-ai';
import { queryRAG } from '@creator/rag-core';
import { SYSTEM_PROMPTS } from '@creator/prompts';
import {
  AgentInput,
  AgentOutput,
  IAgent,
  BusinessPlanOutput,
  MarketResearchOutput,
  FinancialForecastOutput,
  BrandingOutput,
  MarketingOutput,
  ExecutionRoadmapOutput,
  ChatMessage,
  FounderProfile
} from '@creator/types';

const API_KEY = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!genAI) {
    console.log('[Mock LLM] Using fallback due to missing GEMINI_API_KEY');
    return null; // Return null to trigger fallback
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return text;
  } catch (error) {
    console.error('LLM API Error:', error);
    return null;
  }
}

export class BusinessPlanAgent implements IAgent<BusinessPlanOutput> {
  async execute(input: AgentInput): Promise<AgentOutput<BusinessPlanOutput>> {
    const p = input.founderProfile;
    const system = SYSTEM_PROMPTS.BUSINESS_PLAN_AGENT.system;
    const user = SYSTEM_PROMPTS.BUSINESS_PLAN_AGENT.user(p.skills, p.budget, p.industry, p.location, p.commitment);

    let data: BusinessPlanOutput;
    const rawJson = await callLLM(system, user);

    if (rawJson) {
      try {
        data = JSON.parse(rawJson);
      } catch (e) {
        data = this.getFallback(p);
      }
    } else {
      data = this.getFallback(p);
    }

    return {
      agentName: 'Business Plan Agent',
      generatedAt: new Date(),
      summary: `Generated business plan for ${p.industry} in ${p.location}`,
      data,
      confidenceScore: 0.9
    };
  }

  private getFallback(p: FounderProfile): BusinessPlanOutput {
    return {
      businessIdea: `A digital platform bridging the gap in the ${p.industry} sector in ${p.location}, optimized for a ${p.commitment} founder.`,
      targetAudience: `Small to medium businesses in ${p.location} seeking to adopt digital ${p.industry} solutions.`,
      valueProposition: 'Cost-effective, secure, and user-centric approach tailored to local market nuances.',
      revenueModel: ['Subscription-based SaaS', 'Transaction fees on payments'],
      mvpFeatures: ['User Authentication', 'Dashboard & Analytics', 'Payment Integration Sandbox']
    };
  }
}

export class MarketResearchAgent implements IAgent<MarketResearchOutput> {
  async execute(input: AgentInput): Promise<AgentOutput<MarketResearchOutput>> {
    const bp = input.previousOutputs?.businessPlan as BusinessPlanOutput;
    const system = SYSTEM_PROMPTS.MARKET_RESEARCH_AGENT.system;
    const user = SYSTEM_PROMPTS.MARKET_RESEARCH_AGENT.user(bp?.businessIdea || 'Unknown Idea', input.founderProfile.location);

    let data: MarketResearchOutput;
    const rawJson = await callLLM(system, user);

    if (rawJson) {
      try {
        data = JSON.parse(rawJson);
      } catch (e) {
        data = this.getFallback();
      }
    } else {
      data = this.getFallback();
    }

    return {
      agentName: 'Market Research Agent',
      generatedAt: new Date(),
      summary: `Market research analysis completed for target audience.`,
      data,
      confidenceScore: 0.88
    };
  }

  private getFallback(): MarketResearchOutput {
    return {
      validationReport: 'High market demand confirmed with a clear gap in localized, affordable solutions.',
      competitorAnalysis: 'Legacy Solutions Inc: Established Network but slow to innovate.\nGlobal Tech Co: Huge Capital but lacks local localization.',
      trendAnalysis: 'Rapid digital adoption post-2020. Untapped SME segment. Risks include regulatory hurdles.'
    };
  }
}

export class FinancialForecastAgent implements IAgent<FinancialForecastOutput> {
  async execute(input: AgentInput): Promise<AgentOutput<FinancialForecastOutput>> {
    const bp = input.previousOutputs?.businessPlan as BusinessPlanOutput;
    const system = SYSTEM_PROMPTS.FINANCIAL_FORECAST_AGENT.system;
    const user = SYSTEM_PROMPTS.FINANCIAL_FORECAST_AGENT.user(
      bp?.businessIdea || '', 
      bp?.revenueModel || [], 
      input.founderProfile.budget
    );

    let data: FinancialForecastOutput;
    const rawJson = await callLLM(system, user);

    if (rawJson) {
      try {
        data = JSON.parse(rawJson);
      } catch (e) {
        data = this.getFallback(input.founderProfile.budget);
      }
    } else {
      data = this.getFallback(input.founderProfile.budget);
    }

    return {
      agentName: 'Financial Forecast Agent',
      generatedAt: new Date(),
      summary: `Financial projection estimating breakeven at 6 months.`,
      data,
      confidenceScore: 0.85
    };
  }

  private getFallback(budget: number): FinancialForecastOutput {
    return {
      startupCost: budget * 0.4,
      monthlyExpenses: budget * 0.1,
      expectedRevenue: budget * 0.5,
      breakEvenMonth: 6,
      profitProjection: [0, 500, 1200, 2500, 4000, 7000]
    };
  }
}

export class BrandingAgent implements IAgent<BrandingOutput> {
  async execute(input: AgentInput): Promise<AgentOutput<BrandingOutput>> {
    const bp = input.previousOutputs?.businessPlan as BusinessPlanOutput;
    const system = SYSTEM_PROMPTS.BRANDING_AGENT.system;
    const user = SYSTEM_PROMPTS.BRANDING_AGENT.user(bp?.businessIdea || '', bp?.targetAudience || '', bp?.valueProposition || '');

    let data: BrandingOutput;
    const rawJson = await callLLM(system, user);

    if (rawJson) {
      try {
        data = JSON.parse(rawJson);
      } catch (e) {
        data = this.getFallback();
      }
    } else {
      data = this.getFallback();
    }

    return {
      agentName: 'Branding Agent',
      generatedAt: new Date(),
      summary: `Created visual identity and branding guidelines.`,
      data,
      confidenceScore: 0.95
    };
  }

  private getFallback(): BrandingOutput {
    return {
      brandName: 'VentureNova',
      slogan: 'Empowering the next generation of builders.',
      tone: 'Innovative, Bold, Trustworthy',
      logoPrompt: 'Minimalist geometric logo of a rising sun in modern tech style.',
      colorPalette: { primary: '#0F172A', secondary: '#3B82F6', background: '#F8FAFC', accent: '#10B981' }
    };
  }
}

export class MarketingAgent implements IAgent<MarketingOutput> {
  async execute(input: AgentInput): Promise<AgentOutput<MarketingOutput>> {
    const br = input.previousOutputs?.branding as BrandingOutput;
    const system = SYSTEM_PROMPTS.MARKETING_AGENT.system;
    const user = SYSTEM_PROMPTS.MARKETING_AGENT.user(br?.brandName || '', br?.slogan || '', 'SMEs');

    let data: MarketingOutput;
    const rawJson = await callLLM(system, user);

    if (rawJson) {
      try {
        data = JSON.parse(rawJson);
      } catch (e) {
        data = this.getFallback();
      }
    } else {
      data = this.getFallback();
    }

    return {
      agentName: 'Marketing Agent',
      generatedAt: new Date(),
      summary: `Generated multi-channel marketing campaigns.`,
      data,
      confidenceScore: 0.92
    };
  }

  private getFallback(): MarketingOutput {
    return {
      channels: ['LinkedIn Organic', 'Facebook Ads', 'Cold Emailing'],
      campaigns: [
        { platform: 'LinkedIn', headline: 'Stop Wasting Time', description: 'Our platform saves you 20 hours a week.', callToAction: 'Try For Free' }
      ],
      contentIdeas: ['Case study of early adopter', 'Behind the scenes building the startup'],
      socialMediaStrategy: 'Publish weekly educational content and founders journey.'
    };
  }
}

export class ExecutionRoadmapAgent implements IAgent<ExecutionRoadmapOutput> {
  async execute(input: AgentInput): Promise<AgentOutput<ExecutionRoadmapOutput>> {
    const bp = input.previousOutputs?.businessPlan as BusinessPlanOutput;
    const system = SYSTEM_PROMPTS.ROADMAP_AGENT.system;
    const user = SYSTEM_PROMPTS.ROADMAP_AGENT.user(bp?.businessIdea || '', bp?.mvpFeatures || []);

    let data: ExecutionRoadmapOutput;
    const rawJson = await callLLM(system, user);

    if (rawJson) {
      try {
        data = JSON.parse(rawJson);
      } catch (e) {
        data = this.getFallback();
      }
    } else {
      data = this.getFallback();
    }

    return {
      agentName: 'Execution Roadmap Agent',
      generatedAt: new Date(),
      summary: `Created milestone-based launch roadmap.`,
      data,
      confidenceScore: 0.89
    };
  }

  private getFallback(): ExecutionRoadmapOutput {
    return {
      milestones: [
        { title: 'MVP Design', description: 'Design screens', durationWeeks: 2, tasks: ['Figma wireframes'], estimatedCost: 150, dependencies: [] },
        { title: 'Core Engineering', description: 'Build backend and frontend', durationWeeks: 4, tasks: ['Setup API', 'Build UI'], estimatedCost: 500, dependencies: ['MVP Design'] }
      ],
      totalEstimatedBudget: 650,
      totalDurationWeeks: 6
    };
  }
}

export async function runCofounderAgent(
  query: string,
  projectContext: string,
  history: ChatMessage[]
): Promise<ChatMessage> {
  const ragDocs = await queryRAG(query);
  const ragContext = ragDocs.map(doc => `[${doc.title}]: ${doc.content}`).join('\n\n');

  const system = SYSTEM_PROMPTS.COFOUNDER_AGENT.system;
  
  const historyStr = history.slice(-5).map(m => `${m.sender.toUpperCase()}: ${m.message}`).join('\n');
  const user = `Conversation History:\n${historyStr}\n\n${SYSTEM_PROMPTS.COFOUNDER_AGENT.user(query, projectContext, ragContext)}`;

  const responseText = await callLLM(system, user);
  
  if (responseText) {
    return {
      id: `msg_${Date.now()}`,
      sender: 'ai',
      message: responseText,
      timestamp: new Date(),
      ragSources: ragDocs.map(d => d.title)
    };
  }

  return {
    id: `msg_${Date.now()}`,
    sender: 'ai',
    message: 'Based on your request, let’s focus on executing your roadmap efficiently.',
    timestamp: new Date(),
    ragSources: ragDocs.map(d => d.title)
  };
}

export async function orchestrateVentureBuilder(
  projectId: string,
  founderProfile: FounderProfile
) {
  const previousOutputs: Record<string, any> = {};
  const baseInput: AgentInput = { projectId, founderProfile, previousOutputs };

  console.log(`[Orchestrator] Running Business Plan Agent...`);
  const businessPlan = await new BusinessPlanAgent().execute(baseInput);
  previousOutputs.businessPlan = businessPlan.data;

  // Market Research is now handled by n8n workflow triggered from Next.js
  console.log(`[Orchestrator] Running Financial Forecast Agent...`);
  const financialForecast = await new FinancialForecastAgent().execute(baseInput);
  previousOutputs.financialForecast = financialForecast.data;

  console.log(`[Orchestrator] Running Branding Agent...`);
  const branding = await new BrandingAgent().execute(baseInput);
  previousOutputs.branding = branding.data;

  console.log(`[Orchestrator] Running Marketing Agent...`);
  const marketing = await new MarketingAgent().execute(baseInput);
  previousOutputs.marketing = marketing.data;

  console.log(`[Orchestrator] Running Execution Roadmap Agent...`);
  const roadmap = await new ExecutionRoadmapAgent().execute(baseInput);
  previousOutputs.roadmap = roadmap.data;

  return {
    businessPlan,
    financialForecast,
    branding,
    marketing,
    roadmap
  };
}
