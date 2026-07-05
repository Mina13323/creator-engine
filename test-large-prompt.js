const { callFireworksChat } = require('./packages/agents/dist/aiClient.js');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  const systemPrompt = "You are a helpful assistant.";
  const largeContext = "dummy text ".repeat(3000); // ~9000 tokens
  const userPrompt = `Context: ${largeContext}\n\nSay hello!`;

  console.log("Sending large prompt...");
  try {
      const rawJson = await callFireworksChat(systemPrompt, userPrompt, {
        model: 'accounts/fireworks/models/deepseek-v4-flash',
      });
      console.log("Raw JSON:", rawJson ? "SUCCESS" : "NULL");
  } catch (e) {
      console.log("Error:", e);
  }
}

test().catch(console.error);
