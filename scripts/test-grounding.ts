import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runCofounderAgent, buildEgyptContextString } from '../packages/agents/src';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  try {
    const dbUri = process.env.DATABASE_URL;
    if (!dbUri) throw new Error('DATABASE_URL is required');

    await mongoose.connect(dbUri);
    console.info('Connected to MongoDB.');

    const userPrompt = "I want to build a marketplace in Egypt.";
    console.info(`\n--- Grounding Test ---`);
    console.info(`User Prompt: "${userPrompt}"`);
    
    // In actual execution, this is handled via index.ts patching wrapping around runCofounderAgent.
    // However, runCofounderAgent itself is already patched! Let's just run it!
    
    const projectContext = { name: "Egypt Marketplace Project" };
    const contextStr = "--- CURRENT PROJECT CONTEXT ---\\nProject Name: Egypt Marketplace Project\\n-------------------------------\\n\\n";
    
    console.info(`\nCalling runCofounderAgent...`);
    // Note: the patched runCofounderAgent internally calls buildEgyptContextString, but wait, 
    // let's double check if we need to pass something special. We just pass the prompt, context object, and context string.
    
    const response = await runCofounderAgent(userPrompt, projectContext, contextStr);
    
    console.info(`\n--- Agent Response ---`);
    console.info(response.message);
    console.info(`----------------------\n`);
    
    const responseText = response.message.toLowerCase();
    
    let passed = true;
    
    const requiredTerms = ['fawry', 'paymob', 'instapay', 'cod', 'cash on delivery'];
    const hasPayments = requiredTerms.some(t => responseText.includes(t));
    if (!hasPayments) {
      console.info('FAILED: Did not mention Egyptian payment habits (Fawry, Paymob, InstaPay, or COD).');
      passed = false;
    }
    
    if (responseText.includes('stripe') || responseText.includes('usd') || responseText.includes('dollars')) {
      console.info('FAILED: Used US-only advice (Stripe, USD, etc).');
      passed = false;
    }
    
    if (passed) {
      console.info('SUCCESS: Agent is firmly grounded in the Egyptian market reality.');
    } else {
      console.info('TEST FAILED: Grounding issues detected.');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
