const fs = require('fs');

// 1. Patch RoadmapPanel
let code = fs.readFileSync('apps/web/src/components/RoadmapPanel.tsx', 'utf8');
code = code.replace("import { Card } from './ui/card';", "import { Card } from './ui/card';\nimport { ExecutionDashboard } from './ExecutionDashboard';");

const executionDashboardRender = `
  if (roadmap.phases && roadmap.phases.length > 0) {
    return (
      <div className="p-6 md:p-10">
        <ExecutionDashboard 
          roadmap={roadmap} 
          onUpdateTask={(id, status) => console.log('Task updated:', id, status)}
          aiSuggestions={['Talk to 5 potential customers this week', 'Validate your payment gateway integration with Paymob']}
        />
      </div>
    );
  }
`;

code = code.replace('return (\n    <motion.div', executionDashboardRender + '\n  return (\n    <motion.div');
fs.writeFileSync('apps/web/src/components/RoadmapPanel.tsx', code);


// 2. Patch BusinessPlanDashboard to show AIQualityScore
let bpCode = fs.readFileSync('apps/web/src/components/BusinessPlanDashboard.tsx', 'utf8');
bpCode = bpCode.replace("import { Card } from './ui/card';", "import { Card } from './ui/card';\nimport { AIQualityScore } from './AIQualityScore';");

const dummyEval = `
  const mockEval = {
    overallScore: 92,
    scores: {
      marketFit: 95,
      egyptMarketFit: 98,
      feasibility: 85,
      financialReality: 88,
      executionClarity: 90,
      founderAlignment: 96
    },
    recommendations: [
      'Focus on Cash-on-Delivery initially, as it accounts for 70%+ of Egyptian e-commerce transactions.',
      'Your customer acquisition cost is optimistic. Increase marketing budget by 15%.'
    ]
  };
`;

bpCode = bpCode.replace('const { businessPlan } = currentOutputs;', 'const { businessPlan } = currentOutputs;' + dummyEval);

bpCode = bpCode.replace('{/* Overview Cards */}', '<div className="mb-12"><AIQualityScore evaluation={mockEval} /></div>\n\n      {/* Overview Cards */}');

fs.writeFileSync('apps/web/src/components/BusinessPlanDashboard.tsx', bpCode);

console.log('Successfully injected UI components!');
