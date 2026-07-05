import { connectDB, KnowledgeDocumentModel } from '../packages/database/src';
import { embedText } from '../packages/rag-core/src';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB(process.env.DATABASE_URL as string);
  console.info('Connected to DB');

  const docs = await KnowledgeDocumentModel.find({ 
    $or: [
      { embedding: { $size: 0 } },
      { embedding: { $exists: false } }
    ]
  });

  console.info(`Found ${docs.length} documents needing embeddings.`);

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    console.info(`Processing ${i + 1}/${docs.length}: ${doc.docId || doc.documentId}`);
    try {
      const embedding = await embedText(doc.content);
      doc.embedding = embedding;
      await doc.save();
    } catch (err: any) {
      console.error(`Failed to embed ${doc.documentId}:`, err.message);
    }
  }

  console.info('Finished populating embeddings.');
  process.exit(0);
}

run().catch(console.error);
