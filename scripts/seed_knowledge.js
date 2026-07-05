const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (e) {}

const MONGO_URI = process.env.DATABASE_URL;
if (!MONGO_URI) {
  console.error("Error: DATABASE_URL is not set in environment or .env file.");
  process.exit(1);
}

// Define Schema matching packages/database/src/index.ts
const KnowledgeDocumentSchema = new mongoose.Schema({
  userId: { type: String, default: 'system' },
  projectId: { type: String, default: 'global' },
  documentId: { type: String, required: true, unique: true },
  docId: { type: String },
  content: { type: String, required: true },
  category: { type: String, required: true },
  source: { type: String, required: true },
  embedding: { type: [Number], default: [] }
}, { timestamps: true, collection: 'knowledge_vectors' });

const KnowledgeDocumentModel = mongoose.models.KnowledgeDocument || mongoose.model('KnowledgeDocument', KnowledgeDocumentSchema);

const starterDocuments = [
  // 1. Lean Startup Frameworks
  {
    documentId: 'lean-startup-1',
    category: 'lean-startup',
    source: 'Lean Startup Guide',
    content: 'The Build-Measure-Learn feedback loop is the core of the Lean Startup methodology. Start by building a Minimum Viable Product (MVP) to test hypotheses with minimal effort.'
  },
  {
    documentId: 'lean-startup-2',
    category: 'lean-startup',
    source: 'Lean Startup Guide',
    content: 'Failing fast and pivoting based on customer feedback is crucial. A pivot is a structured course correction designed to test a new basic hypothesis about the product, business model, and engine of growth.'
  },
  {
    documentId: 'lean-startup-3',
    category: 'lean-startup',
    source: 'Lean Startup Guide',
    content: 'Innovation Accounting allows startups to assess progress objectively. Establish baseline metrics, tune the engine of growth, and decide whether to pivot or persevere.'
  },
  
  // 2. Business Model Canvas
  {
    documentId: 'bmc-1',
    category: 'business-model-canvas',
    source: 'Business Model Generation',
    content: 'The Business Model Canvas (BMC) consists of nine building blocks: Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships, and Cost Structure.'
  },
  {
    documentId: 'bmc-2',
    category: 'business-model-canvas',
    source: 'Business Model Generation',
    content: 'Value Proposition describes the bundle of products and services that create value for a specific Customer Segment. It must solve a customer problem or satisfy a customer need.'
  },
  {
    documentId: 'bmc-3',
    category: 'business-model-canvas',
    source: 'Business Model Generation',
    content: 'Channels describe how a company communicates with and reaches its Customer Segments to deliver a Value Proposition. Channels can be direct (sales force, website) or indirect (partner stores).'
  },
  {
    documentId: 'bmc-4',
    category: 'business-model-canvas',
    source: 'Business Model Generation',
    content: 'Cost Structure defines all costs incurred to operate a business model. A business can be cost-driven (focus on minimizing costs) or value-driven (focus on value creation).'
  },

  // 3. SaaS Pricing
  {
    documentId: 'saas-pricing-1',
    category: 'saas-pricing',
    source: 'SaaS Pricing Playbook',
    content: 'Value-based pricing dictates that software pricing should reflect the perceived value to the customer rather than cost-plus or competitor-based models.'
  },
  {
    documentId: 'saas-pricing-2',
    category: 'saas-pricing',
    source: 'SaaS Pricing Playbook',
    content: 'A standard SaaS tier structure includes Free/Freemium, a mid-market Pro plan (3-5x the price of the base plan), and an Enterprise plan with custom contract pricing, SLA guarantees, and security features.'
  },
  {
    documentId: 'saas-pricing-3',
    category: 'saas-pricing',
    source: 'SaaS Pricing Playbook',
    content: 'Usage-based or consumption pricing models charge customers based on their activity (e.g., api calls, gigabytes of data stored). This aligns costs directly with client utility.'
  },

  // 4. MVP Development
  {
    documentId: 'mvp-dev-1',
    category: 'mvp-development',
    source: 'MVP Playbook',
    content: 'An MVP must only contain features essential to solve the primary customer problem. Over-engineering is the number one cause of product failure; focus on core value first.'
  },
  {
    documentId: 'mvp-dev-2',
    category: 'mvp-development',
    source: 'MVP Playbook',
    content: 'Using low-code and no-code tools (e.g., Webflow, FlutterFlow, Bubble, Supabase, n8n) allows founders to build functional MVPs and validate concepts in days rather than months.'
  },
  {
    documentId: 'mvp-dev-3',
    category: 'mvp-development',
    source: 'MVP Playbook',
    content: 'The Wizard of Oz MVP model involves presenting a fully automated frontend to the user while performing the operations manually on the backend to test actual market demand.'
  },

  // 5. Product Market Fit
  {
    documentId: 'pmf-1',
    category: 'product-market-fit',
    source: 'PMF Framework',
    content: 'Product-Market Fit (PMF) is achieved when a product has successfully solved a real pain point in a market of significant size, demonstrated by organic growth and high customer retention.'
  },
  {
    documentId: 'pmf-2',
    category: 'product-market-fit',
    source: 'PMF Framework',
    content: 'The Sean Ellis Test measures PMF by asking users: How would you feel if you could no longer use the product? If 40% or more answer "very disappointed," PMF is highly likely.'
  },
  {
    documentId: 'pmf-3',
    category: 'product-market-fit',
    source: 'PMF Framework',
    content: 'Retention curves are the ultimate indicator of PMF. A flat retention curve over time indicates a loyal cohort of users who find permanent value in the product.'
  },

  // 6. Customer Discovery
  {
    documentId: 'cust-disc-1',
    category: 'customer-discovery',
    source: 'The Mom Test',
    content: 'The Mom Test: Never ask anyone if your business idea is good. Instead, ask about their past behaviors, specific problems they face, and how they currently solve them.'
  },
  {
    documentId: 'cust-disc-2',
    category: 'customer-discovery',
    source: 'The Mom Test',
    content: 'Talk about their life instead of your idea. Ask open-ended questions like: "Tell me about the last time you tried to do X." Listen for pain points and constraints.'
  },
  {
    documentId: 'cust-disc-3',
    category: 'customer-discovery',
    source: 'Customer Discovery Guide',
    content: 'Iterative customer interviews should target 15-20 profile interviews in a specific segment. Stop when you begin hearing predictable, repeated answers.'
  },

  // 7. Growth Loops
  {
    documentId: 'growth-loops-1',
    category: 'growth-loops',
    source: 'Growth Strategy',
    content: 'Growth loops are closed systems where the input (e.g., new users) generates an output (e.g., invitations) that feeds back into input, creating sustainable growth.'
  },
  {
    documentId: 'growth-loops-2',
    category: 'growth-loops',
    source: 'Growth Strategy',
    content: 'Viral Loops occur when users naturally invite other users as a side effect of using the product (e.g. sharing document links, peer payments).'
  },
  {
    documentId: 'growth-loops-3',
    category: 'growth-loops',
    source: 'Growth Strategy',
    content: 'Paid Growth Loops reinvest revenue generated from customer acquisition directly back into paid advertising (AdWords, Meta Ads) to acquire more users.'
  },

  // 8. Startup Validation
  {
    documentId: 'validation-1',
    category: 'startup-validation',
    source: 'Validation Methods',
    content: 'Validation requires users to exhibit skin in the game. An email sign-up is weak validation; a pre-order, down payment, or Letter of Intent (LOI) is strong validation.'
  },
  {
    documentId: 'validation-2',
    category: 'startup-validation',
    source: 'Validation Methods',
    content: 'Smoke testing involves launching ads pointing to a landing page for a non-existent product to measure click-through and email conversion rates.'
  },
  {
    documentId: 'validation-3',
    category: 'startup-validation',
    source: 'Validation Methods',
    content: 'B2B startup validation is typically accomplished through Letters of Intent (LOIs) specifying terms under which the client will buy the product once built.'
  },

  // 9. B2B Sales
  {
    documentId: 'b2b-sales-1',
    category: 'b2b-sales',
    source: 'B2B Sales Guide',
    content: 'The B2B sales cycle involves multiple stakeholders: gatekeepers, influencers, champions, and economic buyers. Map out these roles early in the sales conversation.'
  },
  {
    documentId: 'b2b-sales-2',
    category: 'b2b-sales',
    source: 'B2B Sales Guide',
    content: 'Qualify leads using frameworks like BANT (Budget, Authority, Need, Timeline) or MEDDIC to focus sales efforts on prospects likely to close.'
  },
  {
    documentId: 'b2b-sales-3',
    category: 'b2b-sales',
    source: 'B2B Sales Guide',
    content: 'Enterprise sales require solving security, integration, compliance (GDPR, SOC2), and procurement requirements alongside the core product utility.'
  },

  // 10. Startup Finance
  {
    documentId: 'finance-1',
    category: 'startup-finance',
    source: 'Startup Finance 101',
    content: 'Runway is the amount of time a startup has until it runs out of money, calculated as Current Cash Balance divided by Monthly Net Burn Rate.'
  },
  {
    documentId: 'finance-2',
    category: 'startup-finance',
    source: 'Startup Finance 101',
    content: 'Gross Margin is the percentage of revenue remaining after deducting Cost of Goods Sold (COGS). SaaS businesses usually target healthy gross margins of 75-85%.'
  },
  {
    documentId: 'finance-3',
    category: 'startup-finance',
    source: 'Startup Finance 101',
    content: 'Customer Lifetime Value (LTV) to Customer Acquisition Cost (CAC) ratio should exceed 3:1 for a healthy business model. CAC payback period should ideally be under 12 months.'
  },
  {
    documentId: 'finance-4',
    category: 'startup-finance',
    source: 'Startup Finance 101',
    content: 'Working Capital represents the difference between current assets and current liabilities. Managing working capital is critical for inventory-based business models.'
  },
  {
    documentId: 'finance-5',
    category: 'startup-finance',
    source: 'Startup Finance 101',
    content: 'Contribution Margin measures profitability on an individual transaction or unit basis, calculated as Unit Price minus Variable Cost per Unit.'
  },

  // ─────────────────────────────────────────────
  // 11. PITCH DECK EXAMPLES & FRAMEWORKS
  // ─────────────────────────────────────────────
  {
    documentId: 'pitch-airbnb',
    category: 'pitch-deck-examples',
    source: 'Startup Pitch Case Studies',
    content: "Airbnb's original 2009 seed pitch deck is one of the most studied in startup history. Key structure: (1) Problem — travelers pay high hotel prices, hosts have unused rooms; (2) Solution — web platform connecting travelers with locals; (3) Market Validation — 630k listings on Craigslist prove latent demand; (4) Market Size — $2B+ opportunity in budget travel; (5) Business Model — 10% transaction fee; (6) Competitive Advantage — trust through profiles, reviews, payments. Lessons: Start with a relatable, human problem. Use real market proxy data to validate demand before you exist. Keep slides to one idea per page."
  },
  {
    documentId: 'pitch-uber',
    category: 'pitch-deck-examples',
    source: 'Startup Pitch Case Studies',
    content: "Uber's early pitch framed the problem as: 'Everyone who has ever tried to get a cab in San Francisco knows the problem.' This hyper-specific, relatable opener was key. Their narrative: Problem (taxi experience is broken) → Solution (one tap, a car comes to you) → Market Size (taxi industry $4.2B in US alone) → Traction (proof from early SF launch) → Business Model (20% commission) → Ask ($1.25M at $5.75M valuation). Key lesson: Ground the problem in a visceral, personal experience the investor can identify with. Show traction in one market before projecting globally."
  },
  {
    documentId: 'pitch-yc-formula',
    category: 'pitch-deck-examples',
    source: 'Y Combinator Pitch Guidelines',
    content: 'Y Combinator recommends a concise 10-slide deck: (1) Company purpose — one sentence; (2) Problem; (3) Solution — demo or description; (4) Why now — timing insight; (5) Market size — TAM/SAM/SOM; (6) Competition — honest landscape; (7) Product — screenshots or live demo; (8) Business model — how you make money; (9) Team — why you; (10) Financials/Ask — runway and use of funds. Common mistakes: vague problem statements, unrealistic market sizes, no traction slide, team slides without relevant domain expertise.'
  },
  {
    documentId: 'pitch-mena',
    category: 'pitch-deck-examples',
    source: 'MENA Startup Ecosystem Report',
    content: 'MENA investors (Wamda, Flat6Labs, Algebra Ventures, STV) have specific expectations: (1) Show deep local market understanding — regional nuances matter; (2) Demonstrate founder-market fit — why are YOU the right team for Egypt/Saudi/UAE; (3) Unit economics must work in MENA pricing context (lower ARPU than US); (4) Careem differentiated by focusing on driver supply as the key bottleneck; (5) Vezeeta grew by solving appointment booking pain in high specialist wait-time markets; (6) Instabug won MENA by focusing first on developer community outreach. Key: MENA investors want to see path to profitability earlier than US VCs.'
  },
  {
    documentId: 'pitch-narrative-arc',
    category: 'pitch-deck-examples',
    source: 'Investor Pitch Frameworks',
    content: "The most successful investor pitches follow a narrative arc: (1) HOOK — open with a surprising stat, bold claim, or vivid anecdote; (2) PROBLEM — make the investor feel the pain personally; use specificity ('$47B is wasted annually on X'); (3) SOLUTION — explain simply enough for an 8-year-old; (4) TRACTION — numbers proving product-market fit; (5) MARKET — show size without fabricating numbers; (6) TEAM — 2-3 sentences per co-founder, focus on why this team for this market; (7) ASK — be specific: '$500K pre-seed to hire 2 engineers and reach $50K MRR by Q4.' Vague asks lose deals."
  },

  // ─────────────────────────────────────────────
  // 12. BRANDING CASE STUDIES
  // ─────────────────────────────────────────────
  {
    documentId: 'brand-apple',
    category: 'branding-case-studies',
    source: 'Brand Strategy Case Studies',
    content: "Apple's brand is built on three core principles: simplicity, humanity, and creativity. Voice guidelines: Short sentences. No technical jargon. Lead with the human benefit, not the spec. Apple never says '2GHz processor' — they say 'so fast it feels instant.' Brand archetype: The Creator/Magician. Color psychology: Clean white communicates simplicity and purity. Key lesson: Apple positions against 'the rest' without naming competitors. '1,000 songs in your pocket' didn't mention MP3 players — it reframed the category. For startups: Pick one brand promise and ruthlessly filter every message through it."
  },
  {
    documentId: 'brand-notion',
    category: 'branding-case-studies',
    source: 'Brand Strategy Case Studies',
    content: "Notion's brand strategy relies on user-generated content (templates, tutorials) as the primary growth engine. Brand voice: calm, empowering, slightly philosophical. They avoid hype words like 'revolutionary' and use measured language like 'a new tool for thought.' Key branding decisions: (1) Community-first — Notion's brand is as much the user community as the product; (2) Flexibility as identity — let users self-define (students, developers, companies); (3) Typography-forward design — editorial aesthetic stands out in a sea of colorful SaaS tools. Lesson: Positioning as a canvas rather than a point solution can broaden TAM but requires community investment."
  },
  {
    documentId: 'brand-duolingo',
    category: 'branding-case-studies',
    source: 'Brand Strategy Case Studies',
    content: 'Duolingo transformed a utility product (language learning) into an emotionally engaging brand through personality. Key elements: (1) The Duo mascot (green owl) is used in meme-worthy, self-deprecating social content — became a viral loop; (2) Brand voice is playful, slightly unhinged, self-aware — they lean into the joke of "the app that threatens you to practice"; (3) Streak mechanic tied to brand loyalty; (4) Social media strategy: post memes about themselves. Result: 500M downloads driven largely by organic word of mouth. Lesson: If your category is boring, inject personality into the brand — not just the product.'
  },
  {
    documentId: 'brand-egyptian-startups',
    category: 'branding-case-studies',
    source: 'MENA Startup Brand Analysis',
    content: 'Successful Egyptian startup brand strategies: (1) SWVL — positioned as "mass transit reimagined," modern bold identity targeting urban professionals frustrated with microbuses; dark blue palette communicated global ambition; (2) MaxAB — B2B food distribution used "for the love of food" as its narrative, humanizing a supply chain product; (3) Instabug — developer-first brand with technical credibility signals: open source contributions, docs-first approach, dark mode defaults. Key insight: MENA founders must choose between local cultural resonance (Arabic name) vs global scale signals (English name, international design). The choice affects investor perception and talent acquisition.'
  },
  {
    documentId: 'brand-story-framework',
    category: 'branding-case-studies',
    source: 'Brand Story Methodology',
    content: 'The most compelling brand stories follow a four-part arc: (1) ORIGIN — what personal frustration or observation sparked the idea? Authenticity matters; invented origin stories lose trust; (2) MISSION — what are we doing today and for whom? Should be specific enough to exclude: "We help X do Y in context Z"; (3) VALUES — what do we refuse to compromise on? Values differentiate culture and attract the right team; (4) VISION — what does the world look like if we succeed? This is the bigger "why" that transcends the product. Good brand stories are emotionally resonant and factually grounded — never purely aspirational without roots in real experience.'
  },

  // ─────────────────────────────────────────────
  // 13. MARKETING CAMPAIGN EXAMPLES
  // ─────────────────────────────────────────────
  {
    documentId: 'marketing-dsc',
    category: 'marketing-campaign-examples',
    source: 'Viral Marketing Case Studies',
    content: 'Dollar Shave Club launched in 2012 with a $4,500 YouTube video that generated 12,000 orders in 48 hours. Key elements: (1) Founder-fronted video with self-deprecating humor addressed the problem directly; (2) Clear pricing ($1/month) reduced friction; (3) Referral program: "Give a friend a free month, get a free month"; (4) Email nurture sequence reinforced subscription habit. Budget breakdown: $0 celebrity, $4,500 production, $0 paid distribution (organic viral). Lesson: A clear, entertaining value proposition told through a human story beats polished advertising. The founder as face of brand creates authenticity no agency can buy.'
  },
  {
    documentId: 'marketing-product-hunt',
    category: 'marketing-campaign-examples',
    source: 'Launch Playbooks',
    content: 'A successful Product Hunt launch: (1) PRE-LAUNCH (2 weeks before): Build waitlist landing page, recruit a respected hunter (large PH following), collect 200+ beta users who will upvote day-of; (2) LAUNCH DAY: Go live at 12:01am PST, post in Slack communities, Twitter/X, LinkedIn simultaneously, personally DM your network, respond to every comment on PH within 1 hour; (3) POST-LAUNCH: Collect testimonials, follow up with email sequence, write a "lessons learned" blog post. Typical results: 500-2,000 upvotes, 200-1,000 new signups, Product of the Day badge. Key lesson: The launch starts 2 weeks before launch day.'
  },
  {
    documentId: 'marketing-b2b-outreach',
    category: 'marketing-campaign-examples',
    source: 'B2B Sales & Marketing Playbooks',
    content: 'High-converting B2B cold outreach follows AIDA: (1) ATTENTION — personalized first line referencing their specific business or recent news; (2) INTEREST — one sentence on the problem you solve; (3) DESIRE — specific outcome: "We helped [similar company] reduce churn by 34% in 60 days"; (4) ACTION — one low-friction ask: "Would a 15-minute call make sense?" Email sequence: Day 1 — intro (60-80 words max); Day 3 — value-add resource; Day 7 — follow-up with social proof; Day 14 — breakup email. LinkedIn connection requests: 200 characters max, personalized, no pitch. Target 3-5% reply rate as healthy benchmark.'
  },
  {
    documentId: 'marketing-reels-growth',
    category: 'marketing-campaign-examples',
    source: 'Social Media Growth Playbooks',
    content: 'High-performing startup Reels formula: (1) HOOK (0-3 seconds): Text overlay creating curiosity or FOMO — e.g., "I made $10K in 30 days doing this one thing"; (2) CONTENT (3-25 seconds): Deliver the value promised by the hook — tutorials, before/after, behind-the-scenes; (3) ENGAGEMENT TRIGGER (last 5 seconds): Ask a question or tease a follow-up. Hashtag strategy: 3 large (1M+), 3 medium (100K-1M), 3 niche (<100K). Posting cadence for growth: 5-7 Reels per week for first 60 days. Content pillars: Education, Social proof, Behind the scenes, Offers (max 1 in 7 posts). First 15 minutes of engagement determines reach.'
  },
  {
    documentId: 'marketing-whatsapp-mena',
    category: 'marketing-campaign-examples',
    source: 'MENA Digital Marketing Guide',
    content: "WhatsApp is Egypt's primary digital communication channel with 40M+ active users and >90% open rates. Startup playbook: (1) Build broadcast list via opt-in collection at every touchpoint; (2) Segment contacts by stage (leads, customers, VIPs); (3) Max 2-3 broadcasts per week; (4) WhatsApp Business API enables automated sequences for order confirmations, appointment reminders, re-engagement; (5) VIP Groups for top customers — exclusive offers and feedback; (6) Voice notes outperform text for sales outreach in Egypt — personal, casual, high trust. Content types that convert: exclusive discount codes, flash sales, new feature announcements, personal check-ins from the founder."
  }
];

async function seed() {
  console.info('Connecting to MongoDB at:', MONGO_URI.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(MONGO_URI);
    console.info('Connected to database.');

    // Clear existing global documents
    console.info('Clearing old system knowledge base docs...');
    await KnowledgeDocumentModel.deleteMany({ userId: 'system', projectId: 'global' });

    // Insert starter docs
    console.info(`Inserting ${starterDocuments.length} starter documents...`);
    const docsToInsert = starterDocuments.map(doc => ({
      ...doc,
      docId: doc.documentId
    }));
    const inserted = await KnowledgeDocumentModel.insertMany(docsToInsert);
    console.info(`Successfully seeded ${inserted.length} knowledge base documents!`);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.info('Disconnected from database.');
  }
}

seed();
