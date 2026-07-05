import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runMarketDetectionAgent, buildEgyptContextString } from '../packages/agents/src';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testCases = [
  "I want to build a fitness app for trainers in Cairo",
  "An e-commerce platform for vintage clothes in Alexandria",
  "B2B SaaS for HR management",
  "A fintech app for student loans in Egypt",
  "Real estate marketplace for rental apartments in Giza",
  "EdTech platform teaching coding in Arabic",
  "Healthcare booking platform for clinics",
  "Food delivery for home-cooked meals",
  "A CRM for small businesses",
  "Logistics app for last-mile delivery",
  "A digital wallet for unbanked users in Upper Egypt",
  "B2B marketplace for restaurant supplies",
  "A property management software for landlords",
  "Online pharmacy delivery in Egypt",
  "Peer-to-peer car rental platform",
  "A subscription box for organic snacks",
  "Freelance marketplace for Egyptian developers",
  "A micro-lending app for farmers",
  "SaaS for gym management",
  "An AI tutor for high school students in Egypt"
];

async function main() {
  try {
    const dbUri = process.env.DATABASE_URL;
    if (!dbUri) throw new Error('DATABASE_URL is required');

    await mongoose.connect(dbUri);
    console.info('Connected to MongoDB.');

    console.info('\\n--- Testing MarketDetectionAgent & Context Retrieval ---');
    let passed = 0;

    for (let i = 0; i < testCases.length; i++) {
      const idea = testCases[i];
      console.info(`\nTest ${i + 1}: "${idea}"`);
      
      const detection = await runMarketDetectionAgent(idea);
      console.info(`Detected: Country=${detection?.country}, Industry=${detection?.industry}`);

      const context = await buildEgyptContextString(idea, detection?.industry);
      if (context.length > 0) {
        console.info(`SUCCESS: Context retrieved (length ${context.length}).`);
        passed++;
      } else if (detection?.country !== 'Egypt' && detection?.country !== 'Unknown') {
        console.info(`SUCCESS: Skipped context for non-Egypt country.`);
        passed++;
      } else {
        console.info(`FAILED: Missing context.`);
      }
    }

    console.info(`\nValidation complete. Passed: ${passed}/${testCases.length}`);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
