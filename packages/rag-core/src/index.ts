import { KnowledgeDocumentModel } from '@creator/database';

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
}

// Fallback grounded local knowledge database for offline/mock usage
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
 * Generates vector embeddings for a given text using OpenAI or Gemini.
 */
export async function embedText(text: string): Promise<number[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey || openaiKey.includes('sk-proj-')) {
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
 * Falls back to basic term-matching if DB is offline.
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

  // --- FALLBACK LOGIC ---
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

  return KNOWLEDGE_BASE.slice(0, limit);
}
