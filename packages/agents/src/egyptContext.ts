import { getEgyptMarketContext } from '@creator/rag-core';
import { callLLMWithFallback } from './aiClient';

export interface MarketDetection {
  country: string;
  industry: string;
  audience: string;
}

export async function runMarketDetectionAgent(businessIdea: string): Promise<MarketDetection | null> {
  const systemPrompt = `You are an expert Market Detection Agent. Analyze the user's business idea and extract the primary target country, industry, and audience.
If the country is not specified, default to "Unknown".
Output a JSON object matching this schema exactly:
{
  "country": "String (e.g. Egypt, USA, Unknown)",
  "industry": "String (e.g. E-commerce, SaaS, Fintech)",
  "audience": "String (description of target customer)"
}
Output ONLY valid JSON.`;
  
  const userPrompt = `Business Idea: ${businessIdea}`;
  
  try {
    const jsonStr = await callLLMWithFallback(systemPrompt, userPrompt);
    if (!jsonStr) return null;
    return JSON.parse(jsonStr) as MarketDetection;
  } catch (e) {
    console.error('MarketDetectionAgent failed:', e);
    return null;
  }
}

export async function buildEgyptContextString(businessIdea: string, industry?: string): Promise<string> {
  let detectedCountry = "Unknown";
  let detectedIndustry = industry;

  console.info('[EgyptContext] Running MarketDetectionAgent...');
  const detection = await runMarketDetectionAgent(businessIdea);
  if (detection) {
    detectedCountry = detection.country;
    detectedIndustry = detection.industry;
    console.info(`[EgyptContext] Detected Market: ${detectedCountry}, Industry: ${detectedIndustry}`);
  }

  // Only inject Egypt intelligence if country is Egypt or Unknown
  if (detectedCountry.toLowerCase() !== 'egypt' && detectedCountry.toLowerCase() !== 'unknown') {
    console.info(`[EgyptContext] Skipping Egypt RAG injection for country: ${detectedCountry}`);
    return '';
  }

  const context = await getEgyptMarketContext({ businessIdea, industry: detectedIndustry });
  
  let ctxString = `\n\n--- EGYPT MARKET INTELLIGENCE ---\n`;
  
  if (context.marketInsights.length) {
    ctxString += `\nMarket Insights:\n${context.marketInsights.map((i: any) => `- ${i.content}`).join('\n')}\n`;
  }
  
  if (context.competitors.length) {
    ctxString += `\nLocal Competitors:\n${context.competitors.map((i: any) => `- ${i.content}`).join('\n')}\n`;
  }
  
  if (context.risks.length) {
    ctxString += `\nRisks & Challenges:\n${context.risks.map((i: any) => `- ${i.content}`).join('\n')}\n`;
  }
  
  if (context.recommendations.length) {
    ctxString += `\nStrategic Recommendations:\n${context.recommendations.map((i: any) => `- ${i.content}`).join('\n')}\n`;
  }
  
  ctxString += `\nINSTRUCTIONS:
You are building specifically for the Egyptian market.
Use the provided Egypt Market Intelligence.
Consider:
- Egyptian purchasing power
- Local competitors
- Customer behavior
- Available infrastructure
- Payment habits
- Regulations
- Culture
Never assume Silicon Valley conditions unless relevant.\n--------------------------------\n`;

  return ctxString;
}
  
