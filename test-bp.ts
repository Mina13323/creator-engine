import mongoose from 'mongoose';
import { runBusinessPlanAgent } from './packages/agents/src/index.ts';

async function test() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL env var is required'); process.exit(1); }
  await mongoose.connect(url);
  
  const selectedOpportunity = { title: "Test AI Business" };
  const founderProfile = { skills: ["Tech"] };
  
  try {
    // API keys must be provided via .env — never hardcode
    if (!process.env.FIREWORKS_API_KEY) { console.error('FIREWORKS_API_KEY env var is required'); process.exit(1); }
    const plan = await runBusinessPlanAgent("test_proj", selectedOpportunity, founderProfile);
    console.log("Success:", !!plan);
    console.log(JSON.stringify(plan).substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
test();
