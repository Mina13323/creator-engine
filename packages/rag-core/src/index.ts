export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
}

// Grounded local knowledge database for the RAG pipeline
const KNOWLEDGE_BASE: KnowledgeDocument[] = [
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
  }
];

/**
 * Searches the local knowledge base using a basic term-matching algorithm.
 * Extensible to use OpenAI Embeddings and Pinecone in production.
 */
export async function queryRAG(query: string, limit: number = 3): Promise<KnowledgeDocument[]> {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) {
    return KNOWLEDGE_BASE.slice(0, limit);
  }

  // Score documents by counting query term matches in title and content
  const scoredDocs = KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const contentLower = doc.content.toLowerCase();

    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 3;
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

  // Fallback to top documents if no matches found
  return KNOWLEDGE_BASE.slice(0, limit);
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
