import { KnowledgeDocumentModel } from '@creator/database';

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
}

// =========================================================================
// KNOWLEDGE BASE — no seeded production data
// =========================================================================

/**
 * Generates vector embeddings for a given text using Fireworks AI.
 * Throws an error if no valid Fireworks key is found or API fails.
 */
export async function embedText(text: string): Promise<number[]> {
  const fireworksKey = process.env.FIREWORKS_API_KEY;
  if (!fireworksKey) {
    throw new Error('FIREWORKS_API_KEY is not configured');
  }

  try {
    const res = await fetch('https://api.fireworks.ai/inference/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fireworksKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'accounts/fireworks/models/qwen3-embedding-8b',
        dimensions: 1536
      })
    });
    
    if (!res.ok) {
      throw new Error(`Embedding API failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
}

/**
 * Searches the Knowledge Base using MongoDB Atlas Vector Search.
 * Returns empty array if DB is offline.
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
        return results.map((r: any) => ({
          id: r.id || r._id.toString(),
          title: r.title,
          category: r.category,
          content: r.content
        }));
      }
    }
  } catch (err) {
    console.error('MongoDB Vector Search failed or is not configured.', err);
    throw err;
  }

  return [];
}

/**
 * Returns all knowledge documents for a specific category.
 * Useful for seeding, admin review, or category-scoped queries.
 */
export async function getKnowledgeByCategory(category: string): Promise<KnowledgeDocument[]> {
  if (KnowledgeDocumentModel.db.readyState === 1) {
    const results = await KnowledgeDocumentModel.find({ category });
    return results.map((r: any) => ({
      id: r.id || r._id.toString(),
      title: r.title,
      category: r.category,
      content: r.content
    }));
  }
  return [];
}

/**
 * Returns all available knowledge categories in the database.
 */
export async function getKnowledgeCategories(): Promise<string[]> {
  if (KnowledgeDocumentModel.db.readyState === 1) {
    return await KnowledgeDocumentModel.distinct('category');
  }
  return [];
}

export * from './ragService';
export * from './ingestion';
export * from './marketIntelligence';
