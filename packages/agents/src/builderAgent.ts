import { callFireworksChat, callGenericOpenAIChat, parseLLMJson } from './aiClient';

export interface BuilderAgentInput {
  userPrompt: string;
  ventureContext: any;
  brandIdentity: any;
  businessPlan: any;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export async function runWebsiteBuilderAgent(input: BuilderAgentInput, onProgress?: (msg: string) => void): Promise<GeneratedFile[]> {
  const log = (msg: string) => {
    console.log(msg);
    onProgress?.(msg);
  };
  
  log('Running Product Planner Agent...');
  
  const plannerSystemPrompt = `You are a Product Planner Agent. 
Generate a list of pages, features, and design direction for a Next.js website based on the business plan.
Return ONLY a JSON object: { "pages": ["Home", "Pricing"], "features": [], "designDirection": "" }`;

  const plannerUserPrompt = `
User Prompt: ${input.userPrompt}
Venture Context: ${JSON.stringify(input.ventureContext)}
Business Plan: ${JSON.stringify(input.businessPlan)}
Brand Identity: ${JSON.stringify(input.brandIdentity)}
  `;

  const plannerResponse = await callFireworksChat(plannerSystemPrompt, plannerUserPrompt, {
    model: 'accounts/fireworks/models/deepseek-v4-flash',
    response_format: { type: 'json_object' }
  });

  const plannerResult = parseLLMJson<any>(plannerResponse) || { pages: ['Home'], features: [], designDirection: '' };

  log('Running UI Architect Agent...');
  const uiArchitectSystemPrompt = `You are a UI Architect Agent.
Generate a Design System based on the product plan and brand identity.
Return ONLY a JSON object: { "colors": {}, "typography": {}, "components": [], "layout": "" }
Must follow Google Material Design 3 and existing Creator Engine quality.`;

  const uiArchitectUserPrompt = `
Product Plan: ${JSON.stringify(plannerResult)}
Brand Identity: ${JSON.stringify(input.brandIdentity)}
  `;

  const uiArchitectResponse = await callFireworksChat(uiArchitectSystemPrompt, uiArchitectUserPrompt, {
    model: 'accounts/fireworks/models/deepseek-v4-flash',
    response_format: { type: 'json_object' }
  });

  const uiArchitectResult = parseLLMJson<any>(uiArchitectResponse) || {};

  log('Running Code Agent...');
  const codeAgentSystemPrompt = `You are an Expert Web Developer Agent.
Generate the initial files for a website based on the user's venture.
Return ONLY a JSON object with a "files" array: { "files": [ { "path": "index.html", "content": "...", "language": "html" } ] }
Allowed files to generate/edit: index.html, styles.css, script.js.

Rules:
- STRICTLY use Vanilla HTML, CSS, and JS. NO React, NO Next.js.
- DO NOT generate package.json or config files.
- You may include Tailwind CSS via CDN inside the HTML head.
- Ensure the site looks beautiful, modern, and production-ready.`;

  const codeAgentUserPrompt = `
User Prompt: ${input.userPrompt}
Product Plan: ${JSON.stringify(plannerResult)}
Design System: ${JSON.stringify(uiArchitectResult)}

Return the files needed to bootstrap the project.
  `;

  // Use the specific model requested by the user for code generation via GenericOpenAI (BazaarLink/OpenRouter style)
  const codeResponse = await callGenericOpenAIChat(codeAgentSystemPrompt, codeAgentUserPrompt, {
    model: 'deepseek/deepseek-v4-flash',
    response_format: { type: 'json_object' },
    max_tokens: 16384, // allow large output for files
    timeoutMs: 180000, // 3 minutes timeout
    apiKey: process.env.BAZAARLINK_API_KEY,
    baseUrl: 'https://bazaarlink.ai/api/v1'
  });

  const codeResult = parseLLMJson<{ files: GeneratedFile[] }>(codeResponse);
  
  return codeResult?.files || [];
}

export interface BugFixInput {
  error: string;
  files: GeneratedFile[];
  previousAttempts?: any[];
}

export interface BugFixOperation {
  type: 'replace';
  file: string;
  old: string;
  new: string;
}

export async function runBugFixAgent(input: BugFixInput, onProgress?: (msg: string) => void): Promise<BugFixOperation[]> {
  const log = (msg: string) => {
    console.log(msg);
    onProgress?.(msg);
  };
  
  log('Running Bug Fix Agent...');
  const systemPrompt = `You are an Expert Debugger Agent.
Review the build errors and the relevant source code files.
Return ONLY a JSON object with an "operations" array containing patch instructions.
Format: { "operations": [ { "type": "replace", "file": "components/Hero.tsx", "old": "exact string to replace", "new": "replacement string" } ] }
CRITICAL: "old" must match the file content exactly, including whitespace. Do not return the full file.`;

  const userPrompt = `
Errors:
${input.error}

Relevant Context Files:
${JSON.stringify(input.files)}

Previous Failed Attempts:
${JSON.stringify(input.previousAttempts || [])}

Provide the patch operations.
  `;

  const response = await callGenericOpenAIChat(systemPrompt, userPrompt, {
    model: 'deepseek/deepseek-v4-flash',
    response_format: { type: 'json_object' },
    max_tokens: 16384,
    timeoutMs: 180000, // 3 minutes for heavy bug fixing
    apiKey: process.env.BAZAARLINK_API_KEY,
    baseUrl: 'https://bazaarlink.ai/api/v1'
  });

  const result = parseLLMJson<{ operations: BugFixOperation[] }>(response);
  return result?.operations || [];
}
