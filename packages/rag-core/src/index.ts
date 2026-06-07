import { KnowledgeDocumentModel } from '@creator/database';

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
}

// =========================================================================
// KNOWLEDGE BASE — grounded local documents for offline/fallback RAG usage
// Categories: egypt-market-data, pricing-strategies, startup-frameworks,
//             marketing-templates, pitch-deck-examples, branding-case-studies,
//             marketing-campaign-examples
// =========================================================================
const KNOWLEDGE_BASE: KnowledgeDocument[] = [

  // ─────────────────────────────────────────────
  // EGYPT / MENA MARKET DATA
  // ─────────────────────────────────────────────
  {
    id: 'eg-market-1',
    title: 'Egyptian Market Overview 2026',
    category: 'egypt-market-data',
    content: 'Egypt has a population of over 110 million, with a median age of 24.8. E-commerce is expanding at 22% CAGR. Credit card penetration is low (under 10%), making cash on delivery (COD) and mobile wallets (Vodafone Cash, InstaPay) crucial for transaction success. InstaPay has revolutionized instant peer-to-peer and peer-to-merchant payments in the country.'
  },
  {
    id: 'eg-market-2',
    title: 'Rising Sectors in Cairo and Giza',
    category: 'egypt-market-data',
    content: 'Key rising sectors in Cairo and Alexandria include Logistics & Last-Mile Delivery, EdTech, FinTech integrations, and B2B AgriTech. Hyperlocal setups targeting specific neighborhoods (e.g. Maadi, Tagamoa) are proving highly successful compared to countrywide launches.'
  },
  {
    id: 'pricing-1',
    title: 'Value-Based SaaS Pricing Strategy',
    category: 'pricing-strategies',
    content: 'Value-based pricing aligns your pricing model with the value delivered to customer segments (e.g., number of active users, transactions, storage). For B2B products, offer a transparent three-tier strategy (Starter, Growth, Enterprise) with an average conversion goal of 3-5% from free trials to paid tiers.'
  },
  {
    id: 'pricing-2',
    title: 'Egypt Micro-Pricing and Affordability',
    category: 'pricing-strategies',
    content: 'For Egyptian consumers, price sensitivity is high. Subscription services should consider daily or weekly pricing packages (micro-payments) via mobile cash wallets instead of high-barrier annual USD pricing.'
  },
  {
    id: 'lean-framework',
    title: 'Lean Startup Methodology & MVP Building',
    category: 'startup-frameworks',
    content: 'The Lean Startup framework prioritizes Build-Measure-Learn loops. The MVP (Minimum Viable Product) must only contain features essential to solve the core customer problem. Avoid over-engineering; use low-code tools (Webflow, FlutterFlow, Supabase) for initial validation.'
  },
  {
    id: 'marketing-template',
    title: 'Pre-launch Waitlist Playbook',
    category: 'marketing-templates',
    content: 'A pre-launch waitlist is built by offering early-access rewards, beta features, or referral bonuses. Use landing page builders with clear, single call-to-action hooks. Collect emails and phone numbers for WhatsApp marketing, which has over 90% open rates in Egypt.'
  },
  {
    id: 'founder-advice-1',
    title: 'Paul Graham on Doing Things That Don\'t Scale',
    category: 'founder-advice',
    content: 'Startups take off because the founders make them take off. The most common unscalable thing founders have to do at the start is to recruit users manually. You can\'t wait for users to come to you. You have to go out and get them.'
  },
  {
    id: 'startup-playbook-1',
    title: 'The YC Startup Playbook: Finding Product-Market Fit',
    category: 'startup-playbooks',
    content: 'Product-market fit means being in a good market with a product that can satisfy that market. You can always feel when product/market fit isn\'t happening. The customers aren\'t quite getting value out of the product, word of mouth isn\'t spreading, usage isn\'t growing that fast. You can always feel product/market fit when it\'s happening. The customers are buying the product just as fast as you can make it.'
  },
  {
    id: 'mentor-resource-1',
    title: 'Mentoring Framework: B2B Sales Strategy',
    category: 'mentoring-resources',
    content: 'When selling B2B SaaS, your pricing should be based on the ROI you provide to the business. Do not compete on price. Your sales cycle will be long (3-6 months), so you must qualify leads early. The decision-maker is often not the end-user. Always sell the outcome, not the features.'
  },

  // ─────────────────────────────────────────────
  // PITCH DECK EXAMPLES & FRAMEWORKS
  // ─────────────────────────────────────────────
  {
    id: 'pitch-airbnb',
    title: 'Airbnb Seed Pitch Deck Structure & Key Slides',
    category: 'pitch-deck-examples',
    content: 'Airbnb\'s original 2009 seed pitch deck is one of the most studied in startup history. Key structure: (1) Problem — travelers pay high hotel prices, hosts have unused rooms; (2) Solution — web platform connecting travelers with locals; (3) Market Validation — 630k listings on Craigslist prove latent demand; (4) Market Size — $2B+ opportunity in budget travel; (5) Business Model — 10% transaction fee; (6) Competitive Advantage — trust through profiles, reviews, payments. Lessons: Start with a relatable, human problem. Use real market proxy data to validate demand before you exist. Keep slides to one idea per page.'
  },
  {
    id: 'pitch-uber',
    title: 'Uber Pre-Seed Pitch Framework & Narrative',
    category: 'pitch-deck-examples',
    content: 'Uber\'s early pitch framed the problem as: "Everyone who has ever tried to get a cab in San Francisco knows the problem." This hyper-specific, relatable opener was key. Their narrative: Problem (taxi experience is broken) → Solution (one tap, a car comes to you) → Market Size (taxi industry $4.2B in US alone) → Traction (proof from early SF launch) → Business Model (20% commission) → Ask ($1.25M at $5.75M valuation). Key lesson: Ground the problem in a visceral, personal experience the investor can identify with. Show traction in one market before projecting globally.'
  },
  {
    id: 'pitch-yc-formula',
    title: 'Y Combinator Pitch Deck Formula & Common Mistakes',
    category: 'pitch-deck-examples',
    content: 'Y Combinator recommends a concise 10-slide deck: (1) Company purpose — one sentence; (2) Problem — what pain exists; (3) Solution — demo or description; (4) Why now — timing insight; (5) Market size — TAM/SAM/SOM; (6) Competition — honest landscape; (7) Product — screenshots or live demo; (8) Business model — how you make money; (9) Team — why you; (10) Financials/Ask — runway and use of funds. Common YC applicant mistakes: vague problem statements, unrealistic market size calculations, no traction slide, and team slides without relevant domain expertise highlighted.'
  },
  {
    id: 'pitch-mena',
    title: 'MENA Startup Pitch Best Practices (Careem, Vezeeta, Instabug Examples)',
    category: 'pitch-deck-examples',
    content: 'MENA investors (Wamda, Flat6Labs, Algebra Ventures, STV) have specific expectations: (1) Show deep local market understanding — regional nuances matter; (2) Demonstrate founder-market fit — why are YOU the right team for Egypt/Saudi/UAE; (3) Unit economics must work in MENA pricing context (lower ARPU than US); (4) Careem differentiated by focusing on driver supply as the key bottleneck in the MENA market; (5) Vezeeta grew by solving the specific pain of appointment booking in markets with high specialist appointment wait times; (6) Instabug won MENA by focusing first on developer community outreach before enterprise sales. Key advice: MENA investors want to see path to profitability earlier than US VCs.'
  },
  {
    id: 'pitch-narrative-arc',
    title: 'Investor Narrative Arc: Hook → Problem → Solution → Traction → Ask',
    category: 'pitch-deck-examples',
    content: 'The most successful investor pitches follow a narrative arc: (1) HOOK — open with a surprising stat, bold claim, or vivid anecdote that creates urgency; (2) PROBLEM — make the investor feel the pain personally; use specificity ("$47B is wasted annually on X"); (3) SOLUTION — explain it simply enough that an 8-year-old could understand; (4) TRACTION — numbers that prove product-market fit (users, revenue, growth rate, retention); (5) MARKET — show the size of the opportunity without fabricating numbers; (6) TEAM — 2-3 sentences per co-founder, focus on why this team for this market; (7) ASK — be specific: "$500K pre-seed to hire 2 engineers and reach $50K MRR by Q4." Vague asks lose deals.'
  },

  // ─────────────────────────────────────────────
  // BRANDING CASE STUDIES
  // ─────────────────────────────────────────────
  {
    id: 'brand-apple',
    title: 'Apple Brand Identity: "Think Different" Voice Guidelines & Strategy',
    category: 'branding-case-studies',
    content: 'Apple\'s brand is built on three core principles: simplicity, humanity, and creativity. Voice guidelines: Short sentences. No technical jargon. Lead with the human benefit, not the spec. Apple never says "2GHz processor" — they say "so fast it feels instant." Brand archetype: The Creator/Magician. Color psychology: Clean white communicates simplicity and purity; the rainbow logo era communicated creativity; the silver/space gray era communicates premium precision. Key lesson: Apple positions against "the rest" without naming competitors. "1,000 songs in your pocket" didn\'t mention MP3 players — it reframed the category. For startups: Pick one brand promise and ruthlessly filter every message through it.'
  },
  {
    id: 'brand-notion',
    title: 'Notion Brand Redesign: Minimalism, Community-First Positioning',
    category: 'branding-case-studies',
    content: 'Notion\'s brand strategy relies on user-generated content (templates, tutorials) as the primary growth engine. Brand voice: calm, empowering, slightly philosophical. They avoid hype words like "revolutionary" and instead use measured language like "a new tool for thought." Key branding decisions: (1) Community-first — Notion\'s brand is as much the user community as the product; (2) Flexibility as identity — instead of defining a use case, they let users self-define (students, developers, companies); (3) Typography-forward design — clean, editorial aesthetic stands out in a sea of colorful SaaS tools. Lesson: Brand positioning as a platform/canvas rather than a point solution can broaden TAM but requires strong community investment.'
  },
  {
    id: 'brand-duolingo',
    title: 'Duolingo Brand Personality: Fun, Irreverent, High-Engagement',
    category: 'branding-case-studies',
    content: 'Duolingo has transformed a utility product (language learning) into an emotionally engaging brand through personality. Key elements: (1) The Duo mascot (green owl) is used in meme-worthy, self-deprecating social content — "Duo is watching you" became a viral loop; (2) Brand voice is playful, slightly unhinged, self-aware — they lean into the joke of being "the app that threatens you to practice"; (3) Streak mechanic tied to brand loyalty; (4) Social media strategy: post memes about themselves. Result: 500M downloads driven largely by organic word of mouth and social sharing. Lesson for startups: If your category is "boring," inject personality into the brand — not into the product. The brand can be the most memorable feature.'
  },
  {
    id: 'brand-egyptian-startups',
    title: 'Egyptian Startup Branding Examples: Swvl, MaxAB, Instabug',
    category: 'branding-case-studies',
    content: 'Successful Egyptian startup brand strategies: (1) SWVL — positioned as "mass transit reimagined," using a modern, bold brand identity targeting young urban professionals frustrated with microbuses. English brand name with clean dark blue palette communicated global ambition from day one; (2) MaxAB — B2B food distribution platform used "for the love of food" as its brand narrative, humanizing a supply chain product; brand colors (orange/dark) communicated energy and precision for Egyptian FMCG context; (3) Instabug — developer-first brand with technical credibility signals: open source contributions, docs-first approach, dark mode defaults. Key insight: MENA founders must choose: local cultural resonance (Arabic brand name, local imagery) vs global scale signals (English name, international design aesthetic). The choice affects investor perception and talent acquisition.'
  },
  {
    id: 'brand-story-framework',
    title: 'Brand Story Framework: Origin → Mission → Values → Vision',
    category: 'branding-case-studies',
    content: 'The most compelling brand stories follow a four-part arc: (1) ORIGIN — what personal frustration, observation, or insight sparked the idea? Authenticity matters. Invented origin stories lose trust; (2) MISSION — what are we doing today and for whom? Should be specific enough to exclude: "We help X do Y in context Z"; (3) VALUES — what do we refuse to compromise on? (e.g., radical transparency, relentless simplicity, customer obsession). Values differentiate culture and attract the right team; (4) VISION — what does the world look like if we succeed? This is the bigger "why" that transcends the product. Good brand stories are emotionally resonant and factually grounded — never purely aspirational without roots in real experience.'
  },

  // ─────────────────────────────────────────────
  // MARKETING CAMPAIGN EXAMPLES
  // ─────────────────────────────────────────────
  {
    id: 'marketing-dsc',
    title: 'Dollar Shave Club Launch Campaign: Viral Video + Referral Loop',
    category: 'marketing-campaign-examples',
    content: 'Dollar Shave Club launched in 2012 with a $4,500 YouTube video that generated 12,000 orders in 48 hours. Key elements: (1) Founder-fronted video with self-deprecating humor addressed the problem directly; (2) Clear pricing ($1/month) reduced friction; (3) Referral program: "Give a friend a free month, get a free month" — turned customers into salespeople; (4) Email nurture sequence reinforced subscription habit. The marketing insight: the product was commodity razors — the brand and entertainment value was the moat. Budget breakdown: $0 celebrity, $4,500 production, $0 paid distribution (organic viral). Lesson: A clear, entertaining value proposition told through a human story beats polished advertising. The founder as face of brand creates authenticity no agency can buy.'
  },
  {
    id: 'marketing-product-hunt',
    title: 'Product Hunt Launch Playbook: Waitlist + Hunter Outreach',
    category: 'marketing-campaign-examples',
    content: 'A successful Product Hunt launch follows this playbook: (1) PRE-LAUNCH (2 weeks before): Build a waitlist landing page, recruit a respected "hunter" (someone with a large PH following), collect 200+ beta users who will upvote day-of; (2) LAUNCH DAY: Go live at 12:01am PST, post in Slack communities, Twitter/X, LinkedIn simultaneously, personally DM your network, respond to every comment on PH within 1 hour; (3) POST-LAUNCH: Collect testimonials, follow up with email sequence, write a "lessons learned" blog post that drives second-day traffic. Typical results for a well-prepared launch: 500-2,000 upvotes, 200-1,000 new signups, Product of the Day badge. Key lesson: The launch starts 2 weeks before launch day.'
  },
  {
    id: 'marketing-b2b-outreach',
    title: 'B2B SaaS Cold Outreach Templates: LinkedIn + Email Sequences',
    category: 'marketing-campaign-examples',
    content: 'High-converting B2B cold outreach for SaaS follows the AIDA framework: (1) ATTENTION — personalized first line referencing their specific business, recent news, or LinkedIn post; (2) INTEREST — one sentence on the problem you solve; (3) DESIRE — a specific outcome or result (not feature): "We helped [similar company] reduce churn by 34% in 60 days"; (4) ACTION — one low-friction ask: "Would a 15-minute call make sense?" Email sequence structure: Day 1 — intro email (60-80 words max); Day 3 — value-add (share a relevant resource, not another pitch); Day 7 — follow-up with social proof; Day 14 — breakup email ("Last email I\'ll send — I\'ll understand either way"). LinkedIn connection requests: 200 characters max, personalized, no pitch. LinkedIn InMail: same AIDA framework, slightly longer. Target 3-5% reply rate as a healthy benchmark.'
  },
  {
    id: 'marketing-reels-growth',
    title: 'Instagram Reels Content Formula for Startup Growth',
    category: 'marketing-campaign-examples',
    content: 'High-performing startup Reels follow this formula: (1) HOOK (0-3 seconds): A text overlay or spoken statement that creates curiosity or FOMO — e.g., "I made $10K in 30 days doing this one thing"; (2) CONTENT (3-25 seconds): Deliver the value promised by the hook — tutorials, before/after, behind-the-scenes; (3) ENGAGEMENT TRIGGER (last 5 seconds): Ask a question, tease a follow-up, or invite a save. Hashtag strategy: Mix 3 large (1M+), 3 medium (100K-1M), 3 niche (<100K). Posting cadence for growth: 5-7 Reels per week for first 60 days. Content pillars for startups: (a) Education — teach your audience something valuable; (b) Social proof — share user wins and testimonials; (c) Behind the scenes — build founder-audience relationship; (d) Offers — 1 in 7 posts maximum. Algorithm signal: First 15 minutes of engagement determines reach.'
  },
  {
    id: 'marketing-whatsapp-mena',
    title: 'WhatsApp Marketing Playbook for Egyptian/MENA Market',
    category: 'marketing-campaign-examples',
    content: 'WhatsApp is the primary digital communication channel in Egypt, with 40M+ active users and >90% open rates. Startup marketing playbook: (1) Build a broadcast list via opt-in collection at every touchpoint (website, checkout, social bio); (2) Segment contacts by interest/stage (leads, customers, VIPs); (3) Message cadence: max 2-3 broadcasts per week; (4) WhatsApp Business API enables automated sequences — use for order confirmations, appointment reminders, re-engagement; (5) WhatsApp Groups as community: invite top customers to a VIP group for exclusive offers and feedback gathering; (6) Voice notes outperform text for sales outreach in Egypt — personal, casual, high trust. Compliance: Always provide opt-out. Spamming leads to being blocked; blocked reports can get your number banned. Content types that convert: exclusive discount codes, flash sales, new feature announcements, personal check-ins from the founder.'
  }
];

/**
 * Generates vector embeddings for a given text using OpenAI.
 * Returns a dummy embedding array if no valid OpenAI key is found,
 * so keyword fallback search continues to work without API access.
 */
export async function embedText(text: string): Promise<number[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey || openaiKey.includes('sk-proj-') || openaiKey === 'your-openai-key') {
    // Return a dummy embedding array of length 1536 (OpenAI standard) for fallback testing
    return Array(1536).fill(0).map(() => Math.random() - 0.5);
  }

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });
    
    if (!res.ok) {
      throw new Error(`Embedding API failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    // Return dummy on failure so the system doesn't crash completely
    return Array(1536).fill(0).map(() => Math.random() - 0.5);
  }
}

/**
 * Searches the Knowledge Base using MongoDB Atlas Vector Search.
 * Falls back to keyword term-matching if DB is offline or not configured.
 */
export async function queryRAG(query: string, limit: number = 3): Promise<KnowledgeDocument[]> {
  try {
    // If we have a real MongoDB connection, try vector search
    if (KnowledgeDocumentModel.db.readyState === 1) {
      const queryVector = await embedText(query);
      
      // Perform MongoDB Atlas Vector Search
      // Note: This requires an Atlas Search Index named "vector_index" on the collection
      const results = await KnowledgeDocumentModel.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: limit * 10,
            limit: limit
          }
        },
        {
          $project: {
            id: 1,
            title: 1,
            category: 1,
            content: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]);

      if (results && results.length > 0) {
        return results.map(r => ({
          id: r.id,
          title: r.title,
          category: r.category,
          content: r.content
        }));
      }
    }
  } catch (err) {
    console.warn('MongoDB Vector Search failed or not configured, falling back to local text search.', err);
  }

  // --- KEYWORD FALLBACK LOGIC ---
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) {
    return KNOWLEDGE_BASE.slice(0, limit);
  }

  // Score documents by counting query term matches in title, category, and content
  const scoredDocs = KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const contentLower = doc.content.toLowerCase();
    const categoryLower = doc.category.toLowerCase();

    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 4;
      if (categoryLower.includes(word)) score += 2;
      if (contentLower.includes(word)) score += 1;
    }

    return { doc, score };
  });

  // Sort by score descending and filter out zero-match documents if any match exists
  const matches = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc);

  if (matches.length > 0) {
    return matches.slice(0, limit);
  }

  return [];
}

/**
 * Returns all knowledge documents for a specific category.
 * Useful for seeding, admin review, or category-scoped queries.
 */
export function getKnowledgeByCategory(category: string): KnowledgeDocument[] {
  return KNOWLEDGE_BASE.filter(doc => doc.category === category);
}

/**
 * Returns all available knowledge categories in the local knowledge base.
 */
export function getKnowledgeCategories(): string[] {
  return [...new Set(KNOWLEDGE_BASE.map(doc => doc.category))];
}

/**
 * Mock function demonstrating how to integrate real vector database lookups.
 */
export async function queryPineconeVectorDB(query: string, apiKey: string, indexName: string) {
  console.log(`Connecting to Pinecone index ${indexName} with key: ${apiKey.substring(0, 5)}...`);
  // Realistic return contract for vector database integrations
  return [
    { id: 'vec-1', score: 0.92, text: 'Sample retrieved text from Pinecone vector space' }
  ];
}

export * from './ragService';
