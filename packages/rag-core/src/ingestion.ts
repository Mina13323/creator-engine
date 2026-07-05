import { KnowledgeDocumentModel, UploadedDocumentModel } from '@creator/database';
import { embedText } from './index';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export async function processAndIngestDocument(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  userId: string,
  projectId: string,
  documentId: string
) {
  try {
    let text = '';

    if (fileType === 'application/pdf') {
      const pdfData = await pdfParse(fileBuffer);
      text = pdfData.text;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else if (fileType === 'text/plain') {
      text = fileBuffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file type: ' + fileType);
    }

    if (!text.trim()) {
      throw new Error('Extracted text is empty');
    }

    // Chunking: 1000 chars, 200 overlap
    const chunks = chunkText(text, 1000, 200);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await embedText(chunk);
      
      const doc = new KnowledgeDocumentModel({
        userId,
        projectId,
        documentId,
        docId: `${documentId}_chunk_${i}`,
        title: `${fileName} chunk ${i + 1}`,
        content: chunk,
        category: 'user-uploaded',
        source: fileName,
        embedding
      });
      await doc.save();
    }

    await UploadedDocumentModel.updateOne(
      { id: documentId },
      { processingStatus: 'completed' }
    );
  } catch (error) {
    console.error('Ingestion failed for doc:', documentId, error);
    await UploadedDocumentModel.updateOne(
      { id: documentId },
      { processingStatus: 'failed' }
    );
    throw error;
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}
