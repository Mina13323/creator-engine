const fs = require('fs');

let code = fs.readFileSync('apps/api/src/index.ts', 'utf8');

// 1. Imports
code = code.replace(
  `buildContextString,
  getProjectContext
} from '@creator/database';`,
  `buildContextString,
  getProjectContext,
  AIEvaluationModel
} from '@creator/database';`
);

code = code.replace(
  `runPitchAgent } from '@creator/agents';`,
  `runPitchAgent, runEvaluatorAgent } from '@creator/agents';`
);

// 2. Helper
const helperCode = `
// AI Evaluation Helper
async function evaluateAndSave(
  userId,
  projectId,
  targetType,
  targetId,
  input,
  generatedOutput
) {
  if (!dbConnected) return null;
  try {
    const context = await getProjectContext(projectId, userId);
    const { buildEgyptContextString } = await import('@creator/agents');
    const egyptCtx = await buildEgyptContextString(JSON.stringify(input));
    
    const evaluation = await runEvaluatorAgent({
      ventureContext: context,
      egyptMarketContext: egyptCtx,
      generatedOutput,
      targetType
    });
    
    if (evaluation) {
      evaluation.id = \`eval_\${Date.now()}\`;
      evaluation.userId = userId;
      evaluation.projectId = projectId;
      evaluation.targetType = targetType;
      evaluation.targetId = targetId;
      
      const evalDoc = new AIEvaluationModel(evaluation);
      await evalDoc.save();
      return evalDoc.toObject();
    }
  } catch(e) {
    console.error('Evaluation failed:', e);
  }
  return null;
}

// Helper to track Agent Runs`;

code = code.replace('// Helper to track Agent Runs', helperCode);

// 3. Founder Profile Endpoint
code = code.replace(
  /return res\.status\(201\)\.json\(\{ founderProfile \}\);/g,
  `const evaluation = await evaluateAndSave(userId, projectId, 'founder_profile', founderProfile.id, sanitizedData, founderProfile.toObject());\n    return res.status(201).json({ founderProfile, evaluation });`
);

// 4. Opportunity Discovery
code = code.replace(
  /return res\.json\(\{ opportunities: formattedOpportunities \}\);/g,
  `const evaluation = await evaluateAndSave(userId, projectId, 'opportunity', formattedOpportunities[0]?.id, founderProfile.toObject(), formattedOpportunities);\n    return res.json({ opportunities: formattedOpportunities, evaluation });`
);

// 5. Business Plan
code = code.replace(
  /return res\.status\(201\)\.json\(\{ businessPlan \}\);/g,
  `const evaluation = await evaluateAndSave(userId, projectId, 'business_plan', businessPlan.id, selectedOpportunity, businessPlan.toObject());\n    return res.status(201).json({ businessPlan, evaluation });`
);

// 6. Financial Forecast
code = code.replace(
  /return res\.status\(201\)\.json\(\{ financialForecast \}\);/g,
  `const evaluation = await evaluateAndSave(userId, projectId, 'financial_plan', financialForecast.id, businessPlan, financialForecast.toObject());\n    return res.status(201).json({ financialForecast, evaluation });`
);

// 7. Branding
code = code.replace(
  /return res\.status\(201\)\.json\(\{ brandIdentity \}\);/g,
  `const evaluation = await evaluateAndSave(userId, projectId, 'branding', brandIdentity.id, businessPlan, brandIdentity.toObject());\n    return res.status(201).json({ brandIdentity, evaluation });`
);

// 8. Marketing
code = code.replace(
  /return res\.status\(201\)\.json\(\{ marketingCampaign \}\);/g,
  `const evaluation = await evaluateAndSave(userId, projectId, 'marketing', marketingCampaign.id, businessPlan, marketingCampaign.toObject());\n    return res.status(201).json({ marketingCampaign, evaluation });`
);

// 9. Pitch Deck
code = code.replace(
  /return res\.status\(201\)\.json\(\{ pitchDeck \}\);/g,
  `const evaluation = await evaluateAndSave(userId, projectId, 'pitch', pitchDeck.id, businessPlan, pitchDeck.toObject());\n    return res.status(201).json({ pitchDeck, evaluation });`
);


fs.writeFileSync('apps/api/src/index.ts', code);
console.log('Successfully patched index.ts');
