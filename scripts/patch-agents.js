const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../packages/agents/src/index.ts');
let content = fs.readFileSync(filePath, 'utf-8');

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

agents.forEach(agent => {
  const regex = new RegExp(`(export async function ${agent.name}\\([\\s\\S]*?\\)\\s*:\\s*Promise<[^>]+>\\s*{\\s*)(const [^\\n]*?await callN8n)`);
  
  content = content.replace(regex, `$1contextStr = (await import('./egyptContext').then(m => m.buildEgyptContextString(JSON.stringify(${agent.arg})))) + (contextStr ? '\\n\\n' + contextStr : '');\n  $2`);
});

if (!content.includes("export * from './egyptContext'")) {
  content = `export * from './egyptContext';\n` + content;
}

fs.writeFileSync(filePath, content);
console.info('Successfully patched agents with Egypt Market Context injection.');
