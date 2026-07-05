import { callLLMWithFallback } from './aiClient';
import { AIEvaluation } from '@creator/types';

export interface EvaluationInput {
  ventureContext: any;
  egyptMarketContext: string;
  generatedOutput: any;
  targetType: string;
}

export async function runEvaluatorAgent(input: EvaluationInput): Promise<Partial<AIEvaluation> | null> {
  const systemPrompt = `You are a Principal Startup Advisor, Investor, and Product Expert evaluating AI-generated startup outputs.
Your task is to review the generated output against the founder's business context and the realities of the market (specifically Egypt, if applicable).

You must return a JSON object evaluating the output based on 6 criteria (1-100 scale).

JSON Schema:
{
  "overallScore": Number,
  "scores": {
    "marketFit": Number,
    "egyptMarketFit": Number,
    "feasibility": Number,
    "financialReality": Number,
    "executionClarity": Number,
    "founderAlignment": Number
  },
  "strengths": ["String"],
  "weaknesses": ["String"],
  "recommendations": ["String"]
}

Rules:
- Be critical. An output that assumes US-based realities for an Egyptian startup should score low on egyptMarketFit and financialReality.
- Provide actionable recommendations for improvements.
- Output ONLY valid JSON.`;

  const userPrompt = `
TARGET TYPE: ${input.targetType}

VENTURE CONTEXT:
${JSON.stringify(input.ventureContext, null, 2)}

MARKET CONTEXT (EGYPT):
${input.egyptMarketContext}

GENERATED OUTPUT TO EVALUATE:
${JSON.stringify(input.generatedOutput, null, 2)}
`;

  try {
    const jsonStr = await callLLMWithFallback(systemPrompt, userPrompt);
    if (!jsonStr) return null;
    const result = JSON.parse(jsonStr);
    
    // Ensure all required fields exist
    return {
      overallScore: result.overallScore || 0,
      scores: {
        marketFit: result.scores?.marketFit || 0,
        egyptMarketFit: result.scores?.egyptMarketFit || 0,
        feasibility: result.scores?.feasibility || 0,
        financialReality: result.scores?.financialReality || 0,
        executionClarity: result.scores?.executionClarity || 0,
        founderAlignment: result.scores?.founderAlignment || 0
      },
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      recommendations: result.recommendations || []
    };
  } catch (e) {
    console.error('EvaluatorAgent failed:', e);
    return null;
  }
}
