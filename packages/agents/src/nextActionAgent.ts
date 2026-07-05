import { callLLMWithFallback } from './aiClient';

export interface NextActionInput {
  ventureContext: any; // includes evaluations and roadmap now
  egyptMarketContext: string;
}

export interface SmartRecommendation {
  action: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

export async function runNextActionAgent(input: NextActionInput): Promise<SmartRecommendation[]> {
  const systemPrompt = `You are a Principal Startup Advisor providing Next Action recommendations to a founder.
Analyze their venture state, their recent AI Quality Evaluations, and their Execution Roadmap progress.

Identify the top 1 to 3 immediate next actions they must take to move their startup forward or fix severe issues (e.g., if their Financial Score is below 80, recommend a pricing validation task).

Return ONLY valid JSON.

JSON Schema:
[
  {
    "action": "String (e.g. Validate pricing)",
    "reason": "String (e.g. Financial score is below 80)",
    "priority": "high" | "medium" | "low"
  }
]`;

  const userPrompt = `
VENTURE CONTEXT (Includes Evaluations and Roadmap):
${JSON.stringify(input.ventureContext, null, 2)}

EGYPT MARKET CONTEXT:
${input.egyptMarketContext}

Generate the next action recommendations JSON array.`;

  try {
    const jsonStr = await callLLMWithFallback(systemPrompt, userPrompt);
    if (!jsonStr) return [];
    
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('NextActionAgent failed:', e);
    return [];
  }
}
