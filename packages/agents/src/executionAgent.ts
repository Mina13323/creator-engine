import { callLLMWithFallback } from './aiClient';
import { ExecutionRoadmap, ExecutionPhase, ExecutionTask } from '@creator/types';

export interface ExecutionInput {
  ventureState: any;
  egyptMarketContext: string;
  founderProfile: any;
}

export async function runExecutionAgent(input: ExecutionInput): Promise<Partial<ExecutionRoadmap> | null> {
  const systemPrompt = `You are a Principal Startup Execution Architect.
Your task is to generate a highly actionable 90-day execution roadmap for a startup based on its venture state, founder profile, and the market context.

Break the roadmap down into distinct phases (e.g., Day 1-30: Validation, Day 30-60: MVP Build, Day 60-90: Scale).
For each phase, generate specific, prioritized tasks.
The tasks must be realistic and reflect the actual market (especially Egypt, if applicable).

Return ONLY valid JSON.

JSON Schema:
{
  "totalDurationWeeks": 12,
  "totalEstimatedBudget": Number,
  "phases": [
    {
      "name": "Phase Name (e.g. Day 1-30: Validation)",
      "tasks": [
        {
          "title": "Task Title",
          "description": "Detailed explanation",
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
      progress: 0,
      milestones: [] // legacy compatibility
    };
  } catch (e) {
    console.error('ExecutionAgent failed:', e);
    return null;
  }
}
