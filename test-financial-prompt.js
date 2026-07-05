const { runFinancialAgent } = require('./packages/agents/dist/index.js');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  const businessIdea = 'Local OS for Small Retailers (POS + Inventory): A lightweight, offline-capable point-of-sale and inventory management system tailored for small shops and kiosks in Cairo. Integrates with local payment terminals (e.g., Fawry POS) and provides real-time stock tracking, sales analytics, and supplier management. Start as a service (setup and training for EGP 1,000-2,000 per shop) then convert to a monthly subscription (EGP 300-500). MVP can be a web app with PWA support for offline use.';
  const businessModel = 'SaaS';
  
  // Create a dummy context string similar to the user's
  const contextStr = "Dummy context string with a lot of tokens...";

  console.log("Calling agent...");
  const result = await runFinancialAgent('proj_1781780786278', businessIdea, businessModel, contextStr);
  console.log("Result:", result ? "SUCCESS" : "NULL");
  if (!result) {
      console.log("Result is null. Testing callFireworksChat directly...");
      const { callFireworksChat } = require('./packages/agents/dist/aiClient.js');
      const systemPrompt = `You are a startup financial modeler for the Egyptian market (values in EGP). Generate a realistic financial projection based on the business idea and model.\nOutput ONLY a JSON object matching this exact schema:\n{ "financial": {}, "pricing": {} }`;
      const userPrompt = `Idea: ${businessIdea}\nModel: ${businessModel}\nGenerate financial forecast.`;
      const rawJson = await callFireworksChat(systemPrompt, userPrompt, {
        model: 'accounts/fireworks/models/deepseek-v4-flash',
        response_format: { type: 'json_object' }
      });
      console.log("Raw JSON:", rawJson);
  }
}

test().catch(console.error);
