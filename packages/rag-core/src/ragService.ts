import { queryRAG } from "./index";

// Helper to call LLM API (Gemini or OpenAI) with environment keys
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && !geminiKey.includes('AIzaSy...')) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (e) {
      console.warn('Gemini API call in ragService failed:', e);
    }
  }


  return null;
}

export async function generateFinancialPrediction(
  businessIdea: string,
  businessModel: string,
  currency: 'EGP' | 'USD'
) {
  // Query RAG for contextual knowledge docs (e.g. Egyptian pricing guidelines or affordability constraints)
  const ragDocs = await queryRAG(`${businessIdea} ${businessModel} financial planning`);
  const ragContext = ragDocs.map((doc: any) => `[${doc.title}]: ${doc.content}`).join('\n\n');

  const systemPrompt = `You are a startup financial planner. Generate a highly customized financial plan and pricing tiers for the user's business idea in JSON format.
  
  You must output exactly this JSON schema:
  {
    "financial": {
      "startupCosts": [
        { "category": "Legal & Registration", "amount": 2500, "description": "Forming legal entity" }
      ],
      "monthlyCosts": [
        { "category": "Hosting & API Tools", "amount": 120, "isVariable": false, "description": "Server resources" }
      ],
      "revenueProjections": [
        { "month": 1, "projected_revenue": 1000, "cumulative_revenue": 1000 }
      ],
      "breakEvenMonth": 4,
      "assumptionsApplied": ["Growth rate set at 15%", "Local currency EGP/USD considerations applied"]
    },
    "pricing": {
      "recommendedStrategyType": "Tiered Value Subscription",
      "priceTiers": [
        { "tierName": "Starter", "amount": 10, "billingCycle": "monthly", "targetSegment": "Individual contractors", "features": ["Feature A"], "justification": "Budget-friendly option" }
      ],
      "marketPositioningRationale": "Structured for affordability in target markets using mobile payment setups"
    }
  }`;

  const userPrompt = `Business Idea: ${businessIdea}
  Business Model: ${businessModel}
  Preferred Currency: ${currency}
  
  RAG Context Documents:
  ${ragContext}`;

  const rawJson = await callLLM(systemPrompt, userPrompt);
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.financial && parsed.pricing) {
        return parsed;
      }
    } catch (_) {}
  }

  throw new Error('Financial prediction failed: AI provider did not return valid JSON.');
}
