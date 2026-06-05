const mongoose = require('mongoose');
const { connectDB, ProjectModel, FounderProfileModel, BusinessIdeaModel, BusinessValidationModel, BusinessModelModel, BrandIdentityModel, MarketingCampaignModel, ExecutionRoadmapModel } = require('./packages/database/dist/index.js');
const { orchestrateVentureBuilder } = require('./packages/agents/dist/index.js');
require('dotenv').config({ path: './apps/api/.env' });

async function test() {
  try {
    await connectDB(process.env.DATABASE_URL);
    const projectId = 'proj_test_' + Date.now();
    const projectDoc = {
      id: projectId,
      userId: 'usr_test',
      name: 'Test Project',
      description: 'A test project to debug mongoose validation',
      industry: 'Software',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Running orchestrate...');
    const agentOutputs = await orchestrateVentureBuilder(projectId, ['js'], 5000, 'Software', 'Egypt');
    console.log('Orchestrate done.');

    await new ProjectModel(projectDoc).save();
    console.log('Project saved.');
    
    await new FounderProfileModel({
      id: 'fp_' + Date.now(),
      userId: 'usr_test',
      projectId,
      skills: ['js'],
      budget: 5000,
      industry: 'Software',
      location: 'Egypt'
    }).save();
    console.log('Founder profile saved.');

    await new BusinessIdeaModel({ ...agentOutputs.idea, projectId }).save();
    console.log('Idea saved.');

    await new BusinessValidationModel({ ...agentOutputs.validation, projectId }).save();
    console.log('Validation saved.');

    await new BusinessModelModel({ ...agentOutputs.strategy, projectId }).save();
    console.log('Strategy saved.');

    await new BrandIdentityModel({ ...agentOutputs.branding, projectId }).save();
    console.log('Branding saved.');

    await new MarketingCampaignModel({ ...agentOutputs.marketing, projectId }).save();
    console.log('Marketing saved.');

    await new ExecutionRoadmapModel({ ...agentOutputs.roadmap, projectId }).save();
    console.log('Roadmap saved.');

    console.log('ALL SAVED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('MONGOOSE ERROR:', err);
    process.exit(1);
  }
}
test();
