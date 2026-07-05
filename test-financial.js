const { runFinancialAgent } = require('./packages/agents/dist/index.js');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  const result = await runFinancialAgent('test_proj', 'A platform for AI devs', 'SaaS subscription');
  console.log("Result:", JSON.stringify(result, null, 2));
}

test().catch(console.error);
