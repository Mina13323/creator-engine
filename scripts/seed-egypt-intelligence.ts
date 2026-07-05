import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { KnowledgeDocumentModel } from '../packages/database/src';
import { embedText } from '../packages/rag-core/src';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seedEgyptIntelligence() {
  try {
    const mongoUrl = process.env.DATABASE_URL;
    if (!mongoUrl) {
      throw new Error('DATABASE_URL is not set.');
    }
    
    console.info('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.info('Connected.');

    const dataPath = path.join(__dirname, '../data/egypt-market-pack.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('egypt-market-pack.json not found. Run generate-egypt-data.js first.');
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const marketPack = JSON.parse(rawData);
    
    console.info(`Found ${marketPack.length} items to seed.`);
    
    // Process sequentially to respect rate limits, or in small batches
    for (let i = 0; i < marketPack.length; i++) {
      const item = marketPack[i];
      console.info(`Processing ${i + 1}/${marketPack.length}...`);
      
      const embedding = await embedText(item.content);
      
      await KnowledgeDocumentModel.create({
        ...item,
        embedding
      });
      
      // Delay slightly to prevent rate limits from fireworks
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.info('Successfully seeded Egypt Market Intelligence!');
    
    // Validate Mongo Vector count
    const count = await KnowledgeDocumentModel.countDocuments({ type: 'market_intelligence', country: 'Egypt' });
    console.info(`Verified count in MongoDB: ${count} documents.`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedEgyptIntelligence();
