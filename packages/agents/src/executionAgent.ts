import { callLLMWithFallback } from './aiClient';
import { ExecutionRoadmap, ExecutionPhase, ExecutionTask } from '@creator/types';

export interface ExecutionInput {
  ventureState: any;
  egyptMarketContext: string;
  founderProfile: any;
}

export async function runExecutionAgent(input: ExecutionInput): Promise<Partial<ExecutionRoadmap> | null> {
  const systemPrompt = `You are a Principal Startup Execution Architect specializing in the Egyptian startup ecosystem.
Your task is to generate a highly actionable 90-day execution roadmap for a startup based on its venture state, founder profile, and the Egyptian market context.

Break the roadmap down into distinct phases (e.g., Day 1-30: Validation, Day 30-60: MVP Build, Day 60-90: Launch).
For each phase, generate specific, prioritized tasks.
The tasks must be realistic and reflect the actual Egyptian market — use local vendors, local platforms (Fawry, Paymob, OLX, Noon, etc.), local hiring costs.

CRITICAL CURRENCY RULES:
- ALL budget figures MUST be in Egyptian Pounds (EGP).
- Use realistic Egyptian market pricing:
  * Freelancer rates: 500–3,000 EGP/task
  * Monthly junior developer salary: 8,000–15,000 EGP
  * Facebook/Instagram ads: 500–5,000 EGP/month
  * Domain + hosting: 500–2,000 EGP/year
  * Legal registration: 2,000–10,000 EGP
  * Office space (co-working): 2,000–6,000 EGP/month
- NEVER use USD or assume Silicon Valley cost structures.
- The currency field MUST always be "EGP".

Return ONLY valid JSON.

JSON Schema:
{
  "totalDurationWeeks": 12,
  "totalEstimatedBudget": Number,
  "currency": "EGP",
  "phases": [
    {
      "name": "Phase Name (e.g. Day 1-30: Validation)",
      "tasks": [
        {
          "title": "Task Title",
          "description": "Detailed explanation with Egyptian context (local tools, platforms, pricing)",
          "priority": "low" | "medium" | "high",
          "status": "todo"
        }
      ]
    }
  ]
}`;

  const userPrompt = `
FOUNDER PROFILE:
${JSON.stringify(input.founderProfile, null, 2)}

VENTURE STATE (Plan, Opportunity, etc):
${JSON.stringify(input.ventureState, null, 2)}

MARKET CONTEXT (EGYPT):
${input.egyptMarketContext}

Generate the 90-day execution roadmap JSON.`;

  try {
    const jsonStr = await callLLMWithFallback(systemPrompt, userPrompt);
    if (!jsonStr) return null;
    
    // Using a quick regex or JSON.parse to extract the JSON safely
    const parsed = JSON.parse(jsonStr);
    
    // Normalize tasks to ensure IDs and types
    const phases: ExecutionPhase[] = (parsed.phases || []).map((phase: any, pIdx: number) => ({
      id: `phase_${Date.now()}_${pIdx}`,
      name: phase.name,
      tasks: (phase.tasks || []).map((task: any, tIdx: number) => ({
        id: `task_${Date.now()}_${pIdx}_${tIdx}`,
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        aiGenerated: true
      }))
    }));

    return {
      phases,
      totalDurationWeeks: parsed.totalDurationWeeks || 12,
      totalEstimatedBudget: parsed.totalEstimatedBudget || 0,
      currency: parsed.currency || 'EGP',
      progress: 0,
      milestones: [] // legacy compatibility
    };
  } catch (e) {
    console.error('ExecutionAgent failed:', e);
    return null;
  }
}
