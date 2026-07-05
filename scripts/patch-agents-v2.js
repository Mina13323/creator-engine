const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../packages/agents/src/index.ts');
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

const agents = [
  { name: 'runFounderAgent', arg: 'onboardingData' },
  { name: 'runOpportunityAgent', arg: 'founderProfile' },
  { name: 'runBusinessPlanAgent', arg: 'selectedOpportunity' },
  { name: 'runFinancialAgent', arg: 'businessPlan' },
  { name: 'runCofounderAgent', arg: 'projectContext' },
  { name: 'runBrandingAgent', arg: 'businessPlan' },
  { name: 'runMarketingAgent', arg: 'businessPlan' },
  { name: 'runPitchAgent', arg: 'businessPlan' }
];

let inAgent = null;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!inAgent) {
    const match = agents.find(a => line.includes(`export async function ${a.name}(`));
    if (match) {
      inAgent = match.name;
    }
  }
  
  if (inAgent) {
    // Look for the first callN8n inside the function
    if (line.includes('const result = await callN8n') || line.includes('const n8nResult = await callN8n')) {
      const argName = agents.find(a => a.name === inAgent).arg;
      const injected = `  contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(${argName})))) + (contextStr ? '\\n\\n' + contextStr : '');`;
      lines.splice(i, 0, injected);
      inAgent = null; // Done with this agent
      i++; // Skip the newly inserted line
    }
  }
}

let content = lines.join('\n');
if (!content.includes("export * from './egyptContext'")) {
  content = `export * from './egyptContext';\n` + content;
}

fs.writeFileSync(filePath, content);
console.info('Successfully patched with v2.');
