const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Custom Env Parser
try {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (e) {}

const MONGO_URI = process.env.DATABASE_URL || "mongodb+srv://menawaelmagdy_db_user:minawaelmagdy@creator-engine.2krql9o.mongodb.net/creator_engine?appName=creator-engine";
const JWT_SECRET = process.env.JWT_SECRET || 'CreatorEngineSecretKey';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Schemas
const UserSchema = new mongoose.Schema({ id: String, email: String, name: String });
const ProjectSchema = new mongoose.Schema({ id: String, userId: String, name: String, description: String, industry: String, status: String, selectedOpportunityId: String });
const FounderProfileSchema = new mongoose.Schema({
  id: String, userId: String, projectId: String, founderType: String, industryInterests: [String],
  strengths: [String], weaknesses: [String], recommendedBusinessModels: [String], recommendedStartupTypes: [String]
}, { collection: 'founder_profiles' });

const SelectedOpportunitySchema = new mongoose.Schema({
  id: String, userId: String, projectId: String, opportunityId: String,
  title: String, description: String,
  opportunityScore: Number, founderFitScore: Number, marketDemandScore: Number, aiAdvantageScore: Number,
  difficulty: String, startupCost: String, estimatedRevenue: String, timeToMVP: String, selectedAt: Date
}, { collection: 'selected_opportunities' });

const LeanCanvasSchema = new mongoose.Schema({
  problem: [String], solution: [String], keyMetrics: [String],
  uniqueValueProposition: String, unfairAdvantage: String,
  channels: [String], customerSegments: [String], costStructure: [String], revenueStreams: [String]
});

const BusinessPlanSchema = new mongoose.Schema({
  id: String, userId: String, projectId: String,
  executiveSummary: String, problemStatement: String, solution: String, targetAudience: String, marketOpportunity: String,
  leanCanvas: LeanCanvasSchema, customerSegments: [String], businessModel: String, revenueModel: String,
  pricingStrategy: String, goToMarketStrategy: String, mvpScope: [String], successMetrics: [String], growthStrategy: String,
  marketResearchSummary: String, generatedByModel: String, generatedAt: Date,
  version: Number, isLatest: Boolean
}, { collection: 'business_plans' });

const VentureStateSchema = new mongoose.Schema({
  id: String, userId: String, projectId: String,
  founderProfile: mongoose.Schema.Types.Mixed, selectedOpportunity: mongoose.Schema.Types.Mixed,
  latestBusinessPlan: mongoose.Schema.Types.Mixed, businessPlan: mongoose.Schema.Types.Mixed,
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'venture_states' });

const AgentRunSchema = new mongoose.Schema({
  id: String, userId: String, projectId: String, workflow: String, status: String,
  aiModel: String, provider: String, startedAt: Date, completedAt: Date, durationMs: Number,
  input: mongoose.Schema.Types.Mixed, output: mongoose.Schema.Types.Mixed, error: String
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const FounderProfile = mongoose.model('FounderProfile', FounderProfileSchema);
const SelectedOpportunity = mongoose.model('SelectedOpportunity', SelectedOpportunitySchema);
const BusinessPlan = mongoose.model('BusinessPlan', BusinessPlanSchema);
const VentureState = mongoose.model('VentureState', VentureStateSchema);
const AgentRun = mongoose.model('AgentRun', AgentRunSchema);

async function runTest() {
  console.log('--- Business Plan Generation Integration Test ---');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB.');

  const testUserId = 'test_usr_bp_999';
  const testProjectId = 'test_proj_bp_999';
  const oppId = 'opp_test_bp_999';

  // 1. Setup mock database documents
  console.log('Setting up mock database documents...');
  await User.findOneAndUpdate({ id: testUserId }, { email: 'test_bp@creator.com', name: 'Test BP Founder' }, { upsert: true });
  await Project.findOneAndUpdate({ id: testProjectId }, { userId: testUserId, name: 'AI Startup Incubator', description: 'Testing Business Plan', industry: 'SaaS', status: 'draft', selectedOpportunityId: oppId }, { upsert: true });
  
  await FounderProfile.findOneAndUpdate(
    { projectId: testProjectId },
    {
      id: 'fp_test_bp_999',
      userId: testUserId,
      founderType: 'Technical Architect',
      industryInterests: ['SaaS', 'AI', 'Developer Tools'],
      strengths: ['Coding', 'Architecture', 'AI Engineering'],
      weaknesses: ['Sales', 'Cold outreach'],
      recommendedBusinessModels: ['B2B SaaS', 'Usage Pricing'],
      recommendedStartupTypes: ['B2B SaaS']
    },
    { upsert: true }
  );

  await SelectedOpportunity.findOneAndUpdate(
    { opportunityId: oppId, projectId: testProjectId },
    {
      id: 'sel_test_bp_999',
      userId: testUserId,
      title: 'AI Code Auditor',
      description: 'An AI agent that automatically audits code repositories for security and efficiency vulnerabilities.',
      opportunityScore: 92,
      founderFitScore: 95,
      marketDemandScore: 90,
      aiAdvantageScore: 92,
      difficulty: 'Medium',
      startupCost: '$5k',
      estimatedRevenue: '$4k/mo',
      timeToMVP: '3 Weeks',
      selectedAt: new Date()
    },
    { upsert: true }
  );

  // Clear previous business plans, venture states, and agent runs
  await BusinessPlan.deleteMany({ projectId: testProjectId, userId: testUserId });
  await VentureState.deleteMany({ projectId: testProjectId, userId: testUserId });
  await AgentRun.deleteMany({ projectId: testProjectId, userId: testUserId, workflow: 'business-plan' });

  // Initialize fresh VentureState
  await VentureState.findOneAndUpdate(
    { projectId: testProjectId, userId: testUserId },
    {
      id: 'vstate_bp_999',
      founderProfile: { id: 'fp_test_bp_999', founderType: 'Technical Architect' },
      selectedOpportunity: { opportunityId: oppId, title: 'AI Code Auditor' }
    },
    { upsert: true }
  );

  // Generate Token
  const token = jwt.sign({ id: testUserId, email: 'test_bp@creator.com' }, JWT_SECRET, { expiresIn: '1h' });

  try {
    // 2. Generate first version of Business Plan
    console.log('\nTriggering first business plan generation...');
    let res = await fetch(`${API_URL}/api/business-plan/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId: testProjectId })
    });

    if (!res.ok) {
      throw new Error(`Generate V1 failed: ${await res.text()}`);
    }

    let data = await res.json();
    console.log(`- API Success: ${!!data.businessPlan}`);
    console.log(`- Generated Plan ID: ${data.businessPlan.id}`);
    console.log(`- Plan Version: ${data.businessPlan.version} (Expected: 1)`);
    console.log(`- Plan isLatest: ${data.businessPlan.isLatest} (Expected: true)`);
    console.log(`- executiveSummary: "${data.businessPlan.executiveSummary.substring(0, 50)}..."`);
    console.log(`- leanCanvas problem array count: ${data.businessPlan.leanCanvas.problem.length}`);
    console.log(`- mvpScope is array: ${Array.isArray(data.businessPlan.mvpScope)} (Count: ${data.businessPlan.mvpScope.length})`);
    console.log(`- generatedByModel: "${data.businessPlan.generatedByModel}" (Expected: deepseek-v4-flash)`);
    console.log(`- generatedAt: ${data.businessPlan.generatedAt}`);
    console.log(`- marketResearchSummary: "${data.businessPlan.marketResearchSummary.substring(0, 50)}..."`);

    // Verify DB states for V1
    let savedPlans = await BusinessPlan.find({ projectId: testProjectId, userId: testUserId });
    console.log(`- Saved plans count in DB: ${savedPlans.length} (Expected: 1)`);

    let savedVState = await VentureState.findOne({ projectId: testProjectId, userId: testUserId });
    console.log(`- VentureState in DB latestBusinessPlan reference id: ${savedVState.latestBusinessPlan ? savedVState.latestBusinessPlan.id : 'undefined'} (Expected: ${data.businessPlan.id})`);
    console.log(`- VentureState in DB contains full businessPlan object: ${!!savedVState.businessPlan} (Expected: false - no duplication)`);

    // 3. Generate second version of Business Plan (testing versioning)
    console.log('\nTriggering second business plan generation (creating version 2)...');
    res = await fetch(`${API_URL}/api/business-plan/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId: testProjectId })
    });

    if (!res.ok) {
      throw new Error(`Generate V2 failed: ${await res.text()}`);
    }

    data = await res.json();
    console.log(`- API Success: ${!!data.businessPlan}`);
    console.log(`- Generated Plan ID: ${data.businessPlan.id}`);
    console.log(`- Plan Version: ${data.businessPlan.version} (Expected: 2)`);
    console.log(`- Plan isLatest: ${data.businessPlan.isLatest} (Expected: true)`);

    // Verify versioning and isLatest fields in DB
    savedPlans = await BusinessPlan.find({ projectId: testProjectId, userId: testUserId }).sort({ version: 1 });
    console.log(`- Saved plans count in DB: ${savedPlans.length} (Expected: 2)`);
    console.log(`- Version 1 isLatest: ${savedPlans[0].isLatest} (Expected: false)`);
    console.log(`- Version 2 isLatest: ${savedPlans[1].isLatest} (Expected: true)`);

    // Verify VentureState holds the new version reference
    savedVState = await VentureState.findOne({ projectId: testProjectId, userId: testUserId });
    console.log(`- VentureState latestBusinessPlan version reference: ${savedVState.latestBusinessPlan ? savedVState.latestBusinessPlan.version : 'undefined'} (Expected: 2)`);

    // 4. Verify Get Venture State API returns populated business plan
    console.log('\nFetching project state endpoint (/api/projects/:projectId/state)...');
    const stateRes = await fetch(`${API_URL}/api/projects/${testProjectId}/state`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!stateRes.ok) {
      throw new Error(`Get state failed: ${await stateRes.text()}`);
    }

    const stateData = await stateRes.json();
    console.log(`- State response contains businessPlan: ${!!stateData.businessPlan}`);
    console.log(`- State businessPlan version: ${stateData.businessPlan ? stateData.businessPlan.version : 'undefined'} (Expected: 2)`);
    console.log(`- State businessPlan executiveSummary: "${stateData.businessPlan ? stateData.businessPlan.executiveSummary.substring(0, 50) : ''}..."`);

    // 5. Verify Context Endpoint
    console.log('\nFetching project context endpoint (/api/projects/:projectId/context)...');
    const contextRes = await fetch(`${API_URL}/api/projects/${testProjectId}/context`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!contextRes.ok) {
      throw new Error(`Context failed: ${await contextRes.text()}`);
    }

    const contextData = await contextRes.json();
    console.log('- Context response holds keys:');
    console.log(`  - project: ${!!contextData.project}`);
    console.log(`  - founderProfile: ${!!contextData.founderProfile}`);
    console.log(`  - opportunities: ${!!contextData.opportunities && Array.isArray(contextData.opportunities)}`);
    console.log(`  - selectedOpportunity: ${!!contextData.selectedOpportunity}`);
    console.log(`  - businessPlan (top-level): ${!!contextData.businessPlan} (Expected: false - removed per spec)`);
    console.log(`  - ventureState: ${!!contextData.ventureState}`);
    console.log(`  - ventureState.businessPlan: ${!!(contextData.ventureState && contextData.ventureState.businessPlan)} (Expected: true)`);

    // 6. Verify Agent Run Tracking
    console.log('\nChecking MongoDB agent_runs collection...');
    const agentRun = await AgentRun.findOne({ projectId: testProjectId, userId: testUserId, workflow: 'business-plan' });
    if (agentRun) {
      console.log(`- Agent Run logged: ${agentRun.workflow}`);
      console.log(`- Agent Run status: ${agentRun.status}`);
      console.log(`- Agent Run model: ${agentRun.aiModel} (Expected: deepseek-v4-flash)`);
      console.log(`- Agent Run duration: ${agentRun.durationMs}ms`);
    } else {
      console.log('- ERROR: No agent run log found.');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Cleanup
    console.log('\nCleaning up mock data...');
    await User.deleteMany({ id: testUserId });
    await Project.deleteMany({ id: testProjectId });
    await FounderProfile.deleteMany({ projectId: testProjectId, userId: testUserId });
    await SelectedOpportunity.deleteMany({ projectId: testProjectId, userId: testUserId });
    await BusinessPlan.deleteMany({ projectId: testProjectId, userId: testUserId });
    await VentureState.deleteMany({ projectId: testProjectId, userId: testUserId });
    await AgentRun.deleteMany({ projectId: testProjectId, userId: testUserId, workflow: 'business-plan' });
    await mongoose.disconnect();
    console.log('DB Connection closed. Test completed.');
  }
}

runTest();
