import { connectDB, KnowledgeDocumentModel, UploadedDocumentModel } from '../packages/database/src';
import { processAndIngestDocument } from '../packages/rag-core/src/ingestion';
import { queryRAG } from '../packages/rag-core/src';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
  await connectDB(process.env.DATABASE_URL as string);

  console.info('1. Creating a sample PDF buffer...');
  // We don't have a real PDF, so we'll simulate a Text file disguised as PDF parser logic, 
  // or we can just use a raw TXT file to avoid relying on pdf-parse succeeding on corrupted buffers.
  const sampleContent = "Creator Engine RAG Test Document. The secret launch date for the project is November 12th, 2026. The primary marketing strategy relies on influencer partnerships.";
  const buffer = Buffer.from(sampleContent, 'utf-8');

  console.info('2. Ingesting Document...');
  const docId = `test_doc_${Date.now()}`;
  
  // Fake an uploaded document record first
  await new UploadedDocumentModel({
    id: docId,
    userId: 'test_user',
    projectId: 'test_project',
    fileName: 'test.txt',
    fileType: 'text/plain',
    fileSize: buffer.length,
    storageUrl: 'local',
    processingStatus: 'processing'
  }).save();

  await processAndIngestDocument(
    buffer,
    'test.txt',
    'text/plain',
    'test_user',
    'test_project',
    docId
  );

  console.info('3. Verifying chunks in DB...');
  const chunks = await KnowledgeDocumentModel.find({ documentId: docId });
  console.info(`Found ${chunks.length} chunks.`);
  if (chunks.length > 0) {
    console.info('Sample chunk embedding length:', chunks[0].embedding?.length);
  }

  console.info('4. Querying AI Cofounder RAG engine...');
  const results = await queryRAG('What is the secret launch date?');
  
  console.info('\n--- RAG RETRIEVAL RESULTS ---');
  console.info(results);
  console.info('-----------------------------');

  console.info('Test completed successfully!');
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
