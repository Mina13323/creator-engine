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
const BusinessOpportunitySchema = new mongoose.Schema({
  id: String, userId: String, projectId: String,
  title: String, description: String,
  opportunityScore: Number, founderFitScore: Number, marketDemandScore: Number, aiAdvantageScore: Number,
  difficulty: String, startupCost: String, estimatedRevenue: String, timeToMVP: String
}, { collection: 'business_opportunities' });

const SelectedOpportunitySchema = new mongoose.Schema({
  id: String, userId: String, projectId: String, opportunityId: String,
  title: String, description: String,
  opportunityScore: Number, founderFitScore: Number, marketDemandScore: Number, aiAdvantageScore: Number,
  difficulty: String, startupCost: String, estimatedRevenue: String, timeToMVP: String,
  selectedAt: Date
}, { collection: 'selected_opportunities' });

const AgentRunSchema = new mongoose.Schema({
  id: String, userId: String, projectId: String, workflow: String, status: String,
  aiModel: String, provider: String, startedAt: Date, completedAt: Date, durationMs: Number,
  input: mongoose.Schema.Types.Mixed, output: mongoose.Schema.Types.Mixed, error: String
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const BusinessOpportunity = mongoose.model('BusinessOpportunity', BusinessOpportunitySchema);
const SelectedOpportunity = mongoose.model('SelectedOpportunity', SelectedOpportunitySchema);
const AgentRun = mongoose.model('AgentRun', AgentRunSchema);

async function runTest() {
  console.log('--- Opportunity Selection Integration Test ---');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB.');

  const testUserId = 'test_usr_888';
  const testProjectId = 'test_proj_888';
  const oppId1 = 'opp_test_888_1';
  const oppId2 = 'opp_test_888_2';

  // 1. Setup mock user, project, opportunities
  console.log('Setting up mock database documents...');
  await User.findOneAndUpdate({ id: testUserId }, { email: 'test_sel@creator.com', name: 'Test Selection Founder' }, { upsert: true });
  await Project.findOneAndUpdate({ id: testProjectId }, { userId: testUserId, name: 'My Original Project Name', description: 'Testing Opportunity Selection', industry: 'SaaS', status: 'draft', selectedOpportunityId: '' }, { upsert: true });
  
  await BusinessOpportunity.findOneAndUpdate(
    { id: oppId1, projectId: testProjectId },
    {
      userId: testUserId,
      title: 'Mock Opportunity 1',
      description: 'First test opportunity description',
      opportunityScore: 90,
      founderFitScore: 85,
      marketDemandScore: 95,
      aiAdvantageScore: 90,
      difficulty: 'Low',
      startupCost: '$5k',
      estimatedRevenue: '$2k/mo',
      timeToMVP: '2 Weeks'
    },
    { upsert: true }
  );

  await BusinessOpportunity.findOneAndUpdate(
    { id: oppId2, projectId: testProjectId },
    {
      userId: testUserId,
      title: 'Mock Opportunity 2',
      description: 'Second test opportunity description',
      opportunityScore: 85,
      founderFitScore: 90,
      marketDemandScore: 80,
      aiAdvantageScore: 85,
      difficulty: 'Medium',
      startupCost: '$10k',
      estimatedRevenue: '$5k/mo',
      timeToMVP: '4 Weeks'
    },
    { upsert: true }
  );

  // Clear selections
  await SelectedOpportunity.deleteMany({ projectId: testProjectId, userId: testUserId });
  await AgentRun.deleteMany({ projectId: testProjectId, userId: testUserId, workflow: 'opportunity-selection' });

  // Generate Token
  const token = jwt.sign({ id: testUserId, email: 'test_sel@creator.com' }, JWT_SECRET, { expiresIn: '1h' });

  try {
    // 2. Select Opportunity 1
    console.log(`Selecting first opportunity: ${oppId1}...`);
    let selectRes = await fetch(`${API_URL}/api/opportunities/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId: testProjectId, opportunityId: oppId1 })
    });

    if (!selectRes.ok) {
      throw new Error(`Select 1 failed: ${await selectRes.text()}`);
    }

    let selectData = await selectRes.json();
    console.log(`- Select 1 API response success: ${selectData.success}`);
    console.log(`- Selected title: "${selectData.selectedOpportunity.title}"`);

    // Verify DB states for Selection 1
    let savedSelect = await SelectedOpportunity.find({ projectId: testProjectId, userId: testUserId });
    console.log(`- SelectedOpportunity count in DB: ${savedSelect.length} (Expected: 1)`);
    console.log(`- SelectedOpportunity id: ${savedSelect[0].opportunityId} (Expected: ${oppId1})`);
    console.log(`- SelectedOpportunity selectedAt: ${savedSelect[0].selectedAt instanceof Date ? savedSelect[0].selectedAt.toISOString() : savedSelect[0].selectedAt} (Expected: Valid Date)`);

    let updatedProj = await Project.findOne({ id: testProjectId });
    console.log(`- Project selectedOpportunityId: ${updatedProj.selectedOpportunityId} (Expected: ${oppId1})`);
    console.log(`- Project title unchanged: "${updatedProj.name}" (Expected: "My Original Project Name")`);

    // 3. Select Opportunity 2 (replace Selection 1)
    console.log(`\nSelecting second opportunity to replace first: ${oppId2}...`);
    selectRes = await fetch(`${API_URL}/api/opportunities/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId: testProjectId, opportunityId: oppId2 })
    });

    if (!selectRes.ok) {
      throw new Error(`Select 2 failed: ${await selectRes.text()}`);
    }

    selectData = await selectRes.json();
    console.log(`- Select 2 API response success: ${selectData.success}`);

    // Verify DB replacement
    savedSelect = await SelectedOpportunity.find({ projectId: testProjectId, userId: testUserId });
    console.log(`- SelectedOpportunity count in DB: ${savedSelect.length} (Expected: 1 - indicating deletion of first selection)`);
    console.log(`- SelectedOpportunity id: ${savedSelect[0].opportunityId} (Expected: ${oppId2})`);

    updatedProj = await Project.findOne({ id: testProjectId });
    console.log(`- Project updated selectedOpportunityId: ${updatedProj.selectedOpportunityId} (Expected: ${oppId2})`);

    // 4. Verify Context Endpoint
    console.log('\nFetching project context endpoint...');
    const contextRes = await fetch(`${API_URL}/api/projects/${testProjectId}/context`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!contextRes.ok) {
      throw new Error(`Context retrieval failed: ${await contextRes.text()}`);
    }

    const contextData = await contextRes.json();
    console.log('- Context response holds keys:');
    console.log(`  - project: ${!!contextData.project}`);
    console.log(`  - founderProfile: ${!!contextData.founderProfile}`);
    console.log(`  - opportunities: ${!!contextData.opportunities && Array.isArray(contextData.opportunities)} (Length: ${contextData.opportunities ? contextData.opportunities.length : 0})`);
    console.log(`  - selectedOpportunity: ${!!contextData.selectedOpportunity && contextData.selectedOpportunity.opportunityId === oppId2}`);
    console.log(`  - ventureState: ${!!contextData.ventureState}`);

    // 5. Verify Agent Run Tracking
    console.log('\nChecking MongoDB agent_runs collection...');
    const agentRun = await AgentRun.findOne({ projectId: testProjectId, userId: testUserId, workflow: 'opportunity-selection' });
    if (agentRun) {
      console.log(`- Agent Run logged: ${agentRun.workflow}`);
      console.log(`- Agent Run status: ${agentRun.status}`);
      console.log(`- Agent Run model: ${agentRun.aiModel} (Expected: system)`);
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
    await BusinessOpportunity.deleteMany({ projectId: testProjectId, userId: testUserId });
    await SelectedOpportunity.deleteMany({ projectId: testProjectId, userId: testUserId });
    await AgentRun.deleteMany({ projectId: testProjectId, userId: testUserId, workflow: 'opportunity-selection' });
    await mongoose.disconnect();
    console.log('DB Connection closed. Test completed.');
  }
}

runTest();
