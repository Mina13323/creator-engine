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

const MONGO_URI = process.env.DATABASE_URL || "mongodb+srv://menawaelmagdy_db_user:minawaelmagdy@creator-engine.2krql9o.mongodb.net/creator_engine?appName=creator-engine";

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
  }
];

async function seed() {
  console.log('Connecting to MongoDB at:', MONGO_URI.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database.');

    // Clear existing global documents
    console.log('Clearing old system knowledge base docs...');
    await KnowledgeDocumentModel.deleteMany({ userId: 'system', projectId: 'global' });

    // Insert starter docs
    console.log(`Inserting ${starterDocuments.length} starter documents...`);
    const docsToInsert = starterDocuments.map(doc => ({
      ...doc,
      docId: doc.documentId
    }));
    const inserted = await KnowledgeDocumentModel.insertMany(docsToInsert);
    console.log(`Successfully seeded ${inserted.length} knowledge base documents!`);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

seed();
