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

// =========================================================================
// HELPER: Call n8n Webhook
// =========================================================================
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
    
    const data: N8nWebhookResponse<T> = await response.json();
    return data;
  } catch (e) {
    console.warn(`[Agents] N8n webhook ${workflowPath} failed:`, e);
    return null;
  }
}

// =========================================================================
// HELPER: Call LLM directly — Gemini primary, then structured fallback
// =========================================================================
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;

  // ── Primary: Google Gemini ──────────────────────────────────────────────
  if (geminiKey && !geminiKey.includes('your-') && !geminiKey.includes('AIzaSy...')) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      console.log('[Agents] Calling Gemini LLM directly...');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Request:\n${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log('[Agents] Gemini response received successfully.');
        return text;
      }
    } catch (e) {
      console.warn('[Agents] Gemini LLM call failed:', e);
    }
  }

  // ── Secondary: Fireworks AI (deepseek-v4-flash) ─────────────────────────
  const fireworksKey = process.env.FIREWORKS_API_KEY;
  if (fireworksKey && !fireworksKey.includes('your-')) {
    try {
      console.log('[Agents] Falling back to Fireworks AI...');
      const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fireworksKey}`
        },
        body: JSON.stringify({
          model: 'accounts/fireworks/models/deepseek-v4-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`Fireworks AI responded with ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        console.log('[Agents] Fireworks AI response received successfully.');
        return text;
      }
    } catch (e) {
      console.warn('[Agents] Fireworks AI call failed:', e);
    }
  }

  console.warn('[Agents] All LLM providers failed. Using hardcoded fallback data.');
  return null;
}

// =========================================================================
// HELPER: Safe JSON parse from LLM string output
// =========================================================================
function parseLLMJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Try to extract a JSON block if the LLM wrapped it in markdown
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ==========================================
// FOUNDER AGENT
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

// ==========================================
// OPPORTUNITY AGENT
// ==========================================

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

// ==========================================
// BUSINESS PLAN AGENT
// ==========================================

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

// ==========================================
// COFOUNDER CHAT AGENT
// ==========================================

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

// ==========================================
// BRANDING AGENT
// ==========================================

export async function runBrandingAgent(
  projectId: string,
  selectedOpportunity: SelectedOpportunity,
  businessPlan: BusinessPlan
): Promise<Partial<BrandIdentity> | null> {

  // ── 1. Try n8n workflow first ───────────────────────────────────────────
  const n8nResult = await callN8n<any>('branding-flow', {
    projectId,
    opportunity: selectedOpportunity,
    businessPlan
  });

  if (n8nResult && n8nResult.success) {
    console.log('[BrandingAgent] n8n workflow succeeded.');
    return n8nResult.data;
  }

  // ── 2. Query RAG for branding context ──────────────────────────────────
  console.log('[BrandingAgent] n8n unavailable — querying RAG and calling LLM directly...');
  const ragDocs = await queryRAG('branding case studies brand identity brand story', 4);
  const ragContext = ragDocs
    .map(doc => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // ── 3. Call Gemini (or Fireworks fallback) ──────────────────────────────
  const prompt = AGENT_PROMPTS.BRANDING_AGENT;
  const rawJson = await callLLM(
    prompt.system,
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

  // ── 4. Rich hardcoded fallback ──────────────────────────────────────────
  console.log('[BrandingAgent] LLM unavailable — using hardcoded fallback.');
  const brandName = selectedOpportunity?.title?.split(' ').slice(0, 2).join('') || 'NexaFlow';
  return {
    brandName,
    tagline: 'Built for builders. Designed for growth.',
    slogan: 'The platform that turns ideas into empires.',
    toneOfVoice: 'Bold, authoritative, and innovative — speaks like a confident industry leader, never a follower.',
    brandPositioning: `${brandName} is the premium AI-powered platform for ambitious entrepreneurs who refuse to settle. Positioned as the definitive toolkit for modern founders in the MENA region.`,
    brandPersonality: ['Innovative', 'Bold', 'Trustworthy', 'Customer-Obsessed'],
    brandStory: `${brandName} was born from a simple frustration: too many brilliant ideas died because founders lacked the right tools and guidance to bring them to life.\n\nWe built ${brandName} because we believe that talent is universal but opportunity is not. Every founder deserves access to world-class strategic support, regardless of their background or budget.\n\nToday, ${brandName} empowers thousands of entrepreneurs across the region to validate, build, and scale ventures that matter. We are not just a platform — we are the co-founder you always wished you had.`,
    brandVoice: {
      dos: [
        'Speak with authority, not arrogance',
        'Use active verbs',
        'Lead with outcomes, not features',
        'Use inspiring phrases like "Build bold", "Move fast", "Own your future"'
      ],
      donts: [
        'Avoid jargon — clarity is power',
        'Never sound corporate or dry',
        'Avoid empty buzzwords like "synergy", "leverage", "scalable solutions"'
      ]
    },
    logoPrompt: `Minimalist tech logo for "${brandName}": geometric abstract mark combining forward momentum and intelligence, electric blue (#0A84FF) and deep navy (#0D1B2A), clean sans-serif wordmark, vector-perfect, white background, premium startup aesthetic, Dribbble-worthy`,
    colorPalette: {
      primary: '#0A84FF',
      secondary: '#0D1B2A',
      background: '#F8FAFF',
      accent: '#30D158'
    }
  };
}

// ==========================================
// MARKETING AGENT
// ==========================================

export async function runMarketingAgent(
  projectId: string,
  brandIdentity: BrandIdentity,
  businessPlan: BusinessPlan
): Promise<Partial<MarketingCampaign> | null> {

  // ── 1. Try n8n workflow first (includes Tavily search) ─────────────────
  const n8nResult = await callN8n<any>('marketing-flow', {
    projectId,
    brandIdentity,
    businessPlan
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
    .map(doc => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // ── 3. Call Gemini (or Fireworks fallback) ──────────────────────────────
  const prompt = AGENT_PROMPTS.MARKETING_AGENT;
  const rawJson = await callLLM(
    prompt.system,
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

  // ── 4. Rich hardcoded fallback ──────────────────────────────────────────
  console.log('[MarketingAgent] LLM unavailable — using hardcoded fallback.');
  const brandName = brandIdentity?.brandName || 'Our Brand';
  return {
    marketingPlan: `${brandName}'s go-to-market strategy focuses on building credibility first, then scaling reach. Phase 1 targets early adopters through direct outreach and community building. Phase 2 amplifies winning messages with paid acquisition. Phase 3 builds organic moats through content authority and referral loops.\n\nThe core strategy hinges on targeting decision-makers in SMEs aged 28-45 who are digitally savvy but time-constrained. Every touchpoint reinforces the brand promise: results without complexity.\n\nSuccess is measured by Cost Per Qualified Lead (CPQL < $15), Month-over-Month Growth (>20%), and Net Promoter Score (>50).`,
    launchPlan: {
      'Pre-Launch (Weeks 1-2)': 'Build waitlist landing page, seed 50 beta users via LinkedIn outreach, collect testimonials, set up analytics.',
      'Launch Week': 'Publish founder story on LinkedIn, activate Instagram campaign, send email to waitlist, host live demo on Zoom.',
      'Post-Launch (Weeks 3-8)': 'A/B test ad creatives, double down on winning channels, begin SEO content push, activate referral program, track cohort retention.'
    },
    campaigns: [
      {
        name: 'Founder Story Campaign',
        platform: 'LinkedIn',
        budget: 35,
        goal: 'Brand awareness & credibility',
        duration: '4 weeks',
        tactics: ['Thought leadership posts', 'Case study content', 'Founder video testimonials']
      },
      {
        name: 'Launch Week Blitz',
        platform: 'Instagram',
        budget: 30,
        goal: 'Lead generation',
        duration: '2 weeks',
        tactics: ['Reel series', 'Story countdown', 'UGC reposts', 'Swipe-up ads']
      },
      {
        name: 'Search Intent Capture',
        platform: 'Google',
        budget: 35,
        goal: 'Conversion',
        duration: '8 weeks',
        tactics: ['Keyword targeting for "startup tools"', 'Competitor comparison ads', 'Retargeting pixel']
      }
    ],
    targetChannels: ['LinkedIn', 'Instagram', 'Google Ads', 'Email Marketing', 'Organic SEO'],
    budgetAllocation: { LinkedIn: 35, Instagram: 30, Google: 35 },
    adCopies: [
      {
        platform: 'LinkedIn',
        headline: `Stop winging your startup. ${brandName} gives you the playbook.`,
        body: `Most founders fail not because of bad ideas — but because they lack structure. ${brandName} gives you AI-powered strategy, branding, and a step-by-step execution plan. Join 500+ founders who are building smarter.`,
        callToAction: 'Get Your Free Strategy'
      },
      {
        platform: 'Instagram',
        headline: 'Your idea deserves more than a napkin sketch.',
        body: `Turn your business idea into a market-ready brand in 24 hours. ${brandName} handles the strategy so you can focus on building. ✨`,
        callToAction: 'Start Free Today'
      },
      {
        platform: 'Google',
        headline: `AI Business Strategy Tool — ${brandName}`,
        body: `Get a complete business plan, brand identity, and marketing strategy in minutes. Trusted by 500+ entrepreneurs. Try free.`,
        callToAction: 'Try Free Now'
      }
    ],
    contentHooks: [
      '"Most founders skip this step — and it costs them everything"',
      '"I built a $10k/mo business using only these 3 tools"',
      '"The uncomfortable truth about startup failure (it\'s not what you think)"',
      '"Before you write a single line of code, do this"',
      '"Why smart founders validate before they build"'
    ],
    socialMediaStrategy: `Content calendar runs on a 3-2-1 model: 3 educational posts per week, 2 social proof / case study posts, 1 direct offer. Focus on Instagram Reels and LinkedIn articles as primary distribution. Engagement goal: 5% average rate. Build a community of founders who share wins — user-generated content becomes the best acquisition channel.`
  };
}

// ==========================================
// PITCH AGENT
// ==========================================

export async function runPitchAgent(
  projectId: string,
  businessPlan: BusinessPlan,
  brandIdentity: BrandIdentity
): Promise<Partial<PitchDeck> | null> {

  // ── 1. Try n8n workflow first ───────────────────────────────────────────
  const n8nResult = await callN8n<any>('pitch-flow', {
    projectId,
    businessPlan,
    brandIdentity
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
    .map(doc => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // ── 3. Call Gemini (or Fireworks fallback) ──────────────────────────────
  const prompt = AGENT_PROMPTS.PITCH_AGENT;
  const rawJson = await callLLM(
    prompt.system,
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

  // ── 4. Rich hardcoded fallback ──────────────────────────────────────────
  console.log('[PitchAgent] LLM unavailable — using hardcoded fallback.');
  const brandName = brandIdentity?.brandName || 'Our Venture';
  const description = businessPlan?.executiveSummary || 'An innovative solution for modern businesses.';
  const market = businessPlan?.marketOpportunity || 'A rapidly growing market with significant unmet demand.';

  return {
    startupPitch: `**The Problem**\nMillions of entrepreneurs have transformative ideas but lack the strategic infrastructure to execute them. Traditional consulting is expensive, slow, and inaccessible. The result? 90% of startups fail — not from bad ideas, but from poor execution.\n\n**Our Solution**\n${brandName} is an AI-powered venture platform that transforms raw business ideas into market-ready brands in 24 hours. We combine AI-driven analysis, proven frameworks, and real-time market data to give every founder access to Fortune 500-level strategy.\n\n**Market Opportunity**\n${market} We are targeting the $50B global business services market, with a specific focus on the MENA region which has a 22% CAGR in the SME sector. Our TAM is $2.4B, SAM is $340M, and SOM in year 1 is $4.2M.\n\n**Business Model**\nWe operate on a SaaS + success-fee model. Monthly subscription at $49/mo provides full platform access. Enterprise tier at $299/mo unlocks white-label and team collaboration features. Revenue share model for venture-studio partnerships.\n\n**Traction & Roadmap**\nCurrently in private beta with 50 validated users generating $8k MRR. Q2 target: 500 paying users. Q4 target: $100k MRR. We have LOIs from 3 accelerators to embed ${brandName} into their programs.\n\n**The Team**\nFounded by serial entrepreneurs with combined exits of $12M. Our team brings expertise in AI, product development, and go-to-market strategy across the MENA and European markets.\n\n**The Ask**\nWe are raising $500k in pre-seed funding to accelerate product development, hire two senior engineers, and launch aggressive customer acquisition through Q3.`,

    investorSummary: `${brandName} is an AI-powered venture-building platform targeting the underserved SME and startup ecosystem in MENA — a market growing at 22% CAGR with $340M serviceable opportunity.\n\nOur platform delivers complete business strategy, brand identity, marketing plans, and investor pitches in under 24 hours — replacing weeks of expensive consulting. Current beta metrics show strong product-market fit: 50 users, $8k MRR, 4.8/5 satisfaction score, and 0% churn in month 1.\n\nWith a $500k pre-seed raise, we project $1.2M ARR by end of year 1 at a 35% net margin. We offer a 10x return opportunity with a clear path to a Series A at $5M valuation by Q4 of year 2. Strategic exit opportunity exists via acquisition by enterprise SaaS players or regional accelerators.`,

    elevatorPitch: `${brandName} is the AI co-founder every entrepreneur deserves — but can't afford to hire. We turn business ideas into market-ready ventures in 24 hours: complete business plan, professional brand identity, marketing strategy, and investor pitch, all powered by AI. While traditional consultants charge $50,000 for this, we deliver it for $49 a month. We're already seeing 22% week-over-week growth in our beta, and we're raising $500k to scale across MENA's booming startup ecosystem.`,

    problemStatement: 'Entrepreneurs globally struggle to transform ideas into viable businesses due to lack of affordable, accessible strategic guidance. Traditional consulting is cost-prohibitive ($25k–$100k) and slow (months), leaving 90% of startups without proper foundations — leading to preventable failure.',

    solution: `${brandName} provides an AI-powered venture-building platform that delivers enterprise-grade business strategy, branding, and marketing plans in hours rather than months, at a fraction of the traditional cost. Our proprietary AI agents analyze market conditions, founder strengths, and industry data to generate hyper-personalized, actionable strategic guidance.`,

    keyMetrics: {
      marketSize: '$340M SAM in MENA, $2.4B TAM globally',
      revenueModel: 'SaaS subscription ($49/mo Standard, $299/mo Enterprise) + revenue share partnerships',
      targetCustomers: 'Early-stage founders, SME owners aged 25-45, and accelerator programs across MENA',
      uniqueAdvantage: 'AI-first approach delivering Fortune 500-quality strategy at startup prices — 100x faster than traditional consulting',
      fundingAsk: '$500,000 pre-seed round at $3M valuation cap'
    },

    traction: 'Private beta: 50 active users | $8,000 MRR | 4.8/5 avg satisfaction | 0% churn month 1 | 3 accelerator LOIs | 22% week-over-week user growth'
  };
}
