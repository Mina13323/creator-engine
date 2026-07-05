const fs = require('fs');
let code = fs.readFileSync('packages/database/src/services/projectContext.ts', 'utf8');

// 1. Imports
code = code.replace(
  'UploadedDocumentModel',
  'UploadedDocumentModel,\n  AIEvaluationModel'
);

// 2. Add evaluations to Promise.all array
code = code.replace(
  /const \[\s*project,\s*founderProfile,\s*selectedOpportunity,\s*businessPlan,\s*financialForecast,\s*branding,\s*marketingPlan,\s*pitchDeck,\s*roadmap,\s*uploadedDocuments\s*\] = await Promise\.all\(\[/m,
  `const [
    project,
    founderProfile,
    selectedOpportunity,
    businessPlan,
    financialForecast,
    branding,
    marketingPlan,
    pitchDeck,
    roadmap,
    evaluations,
    uploadedDocuments
  ] = await Promise.all([`
);

// 3. Add AIEvaluationModel.find to Promise.all
code = code.replace(
  'ExecutionRoadmapModel.findOne({ projectId, userId, isLatest: true }),',
  'ExecutionRoadmapModel.findOne({ projectId, userId }),\n    AIEvaluationModel.find({ projectId, userId }),'
);

// 4. Return evaluations in context object
code = code.replace(
  'roadmap: roadmap?.toObject() || null,',
  'roadmap: roadmap?.toObject() || null,\n    evaluations: evaluations?.map((e: any) => e.toObject()) || [],'
);

// 5. Append to context string
const appends = `
  if (context.roadmap) {
    ctxStr += '\\n--- EXECUTION ROADMAP ---\\n';
    ctxStr += \`Progress: \${context.roadmap.progress}%\\n\`;
    context.roadmap.phases?.forEach((p: any) => {
      ctxStr += \`Phase: \${p.name}\\n\`;
      const pendingTasks = p.tasks?.filter((t: any) => t.status !== 'done') || [];
      if (pendingTasks.length > 0) {
        ctxStr += \`Incomplete Tasks:\\n\`;
        pendingTasks.forEach((t: any) => {
          ctxStr += \` - \${t.title} (Priority: \${t.priority})\\n\`;
        });
      }
    });
  }

  if (context.evaluations && context.evaluations.length > 0) {
    ctxStr += '\\n--- AI QUALITY EVALUATIONS ---\\n';
    context.evaluations.forEach((ev: any) => {
      ctxStr += \`Type: \${ev.targetType} | Score: \${ev.overallScore}/100\\n\`;
      if (ev.recommendations?.length > 0) {
        ctxStr += \`Recommendations: \${ev.recommendations.join(', ')}\\n\`;
      }
    });
  }
`;

code = code.replace(
  'ctxStr += `-------------------------------\\n\\n`;',
  appends + '\n  ctxStr += `-------------------------------\\n\\n`;'
);

fs.writeFileSync('packages/database/src/services/projectContext.ts', code);
console.log('Patched projectContext.ts');
