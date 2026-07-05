import { KnowledgeDocumentModel } from '@creator/database';
import { embedText } from './index';

export interface MarketContextRequest {
  businessIdea: string;
  industry?: string;
  agentType?: string;
}

export interface MarketContextResponse {
  marketInsights: any[];
  competitors: any[];
  risks: any[];
  recommendations: any[];
}

export async function getEgyptMarketContext(params: MarketContextRequest): Promise<MarketContextResponse> {
  const { businessIdea, industry } = params;

  try {
    const query = `${businessIdea} ${industry || ''} Egypt Market Context`;
    const queryEmbedding = await embedText(query);

    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: "vector_index", // using default standard atlas vector index name
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 15
        }
      },
      {
        $match: {
          type: "market_intelligence",
          country: "Egypt"
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          content: 1,
          industry: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    if (industry) {
        // give weight to industry if provided but don't strictly exclude
        // The match above is already strict on Egypt, we let vector similarity handle the rest
    }

    const results = await KnowledgeDocumentModel.aggregate(pipeline);

    // Group insights
    const response: MarketContextResponse = {
      marketInsights: [],
      competitors: [],
      risks: [],
      recommendations: []
    };

    if (results && results.length > 0) {
      results.forEach(doc => {
        if (doc.category === 'competitors') {
          response.competitors.push(doc);
        } else if (doc.category === 'regulations' || doc.content.toLowerCase().includes('challenge') || doc.content.toLowerCase().includes('weakness')) {
          response.risks.push(doc);
        } else if (doc.category === 'pricing' || doc.category === 'marketing') {
          response.recommendations.push(doc);
        } else {
          response.marketInsights.push(doc);
        }
      });
    }

    return response;
  } catch (err) {
    console.error('Failed to get Egypt Market Context from Vector DB:', err);
    return {
      marketInsights: [],
      competitors: [],
      risks: [],
      recommendations: []
    };
  }
}
