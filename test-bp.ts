import mongoose from 'mongoose';
import { runBusinessPlanAgent } from './packages/agents/src/index.ts';

async function test() {
  const url = process.env.DATABASE_URL || "mongodb://menawaelmagdy_db_user:minawaelmagdy@ac-ewbnhwg-shard-00-00.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-01.2krql9o.mongodb.net:27017,ac-ewbnhwg-shard-00-02.2krql9o.mongodb.net:27017/creator_engine?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=creator-engine";
  await mongoose.connect(url);
  
  const selectedOpportunity = { title: "Test AI Business" };
  const founderProfile = { skills: ["Tech"] };
  
  try {
    process.env.FIREWORKS_API_KEY = "fw_LD3fcuYLt2cZ2iQZiUwEtc";
    process.env.FIREWORKS_API_KEY_CHAT = "fw_QNTSsWDKX61HU4Z7DPPVhY";
    const plan = await runBusinessPlanAgent("test_proj", selectedOpportunity, founderProfile);
    console.log("Success:", !!plan);
    console.log(JSON.stringify(plan).substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
test();
