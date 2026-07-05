import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

import { 
  runFounderAgent, 
  runOpportunityAgent, 
  runBusinessPlanAgent, 
  runFinancialAgent 
} from '../packages/agents/src/index';

async function testAgents() {
  console.info('Testing agents (with n8n offline to trigger fallback)...');
  
  try {
    const founderProfile = await runFounderAgent('test_project', {
      background: 'Software Engineer with 10 years experience',
      interests: ['AI', 'Productivity', 'B2B SaaS']
    });
    console.info('\n--- FOUNDER AGENT ---');
    console.info(JSON.stringify(founderProfile, null, 2));

    if (!founderProfile) throw new Error("Founder profile failed");

    const opportunities = await runOpportunityAgent('test_project', founderProfile as any);
    console.info('\n--- OPPORTUNITY AGENT ---');
    console.info(JSON.stringify(opportunities, null, 2));

    if (!opportunities || opportunities.length === 0) throw new Error("Opportunity generation failed");

    const businessPlan = await runBusinessPlanAgent('test_project', opportunities[0], founderProfile);
    console.info('\n--- BUSINESS PLAN AGENT ---');
    console.info(JSON.stringify(businessPlan, null, 2));

    const financialForecast = await runFinancialAgent('test_project', opportunities[0].description, 'SaaS');
    console.info('\n--- FINANCIAL AGENT ---');
    console.info(JSON.stringify(financialForecast, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAgents();
