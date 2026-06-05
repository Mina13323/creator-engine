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

const MONGO_URI = process.env.DATABASE_URL;
if (!MONGO_URI) {
  console.error("Error: DATABASE_URL is not set in environment or .env file.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || 'CreatorEngineSecretKey';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Schemas
const UserSchema = new mongoose.Schema({ id: String, email: String, name: String });
const ProjectSchema = new mongoose.Schema({ id: String, userId: String, name: String, description: String, industry: String, status: String });
const FounderProfileSchema = new mongoose.Schema({
  id: String, userId: String, projectId: String,
  skills: [String], experience: String, industryInterests: [String],
  budget: Number, location: String, availableTime: String,
  startupGoals: String, riskTolerance: String, teamSize: String,
  founderType: String, strengths: [String], weaknesses: [String]
}, { collection: 'founder_profiles' });

const BusinessOpportunitySchema = new mongoose.Schema({
  id: String, userId: String, projectId: String,
  title: String, description: String,
  opportunityScore: Number, founderFitScore: Number, marketDemandScore: Number, aiAdvantageScore: Number,
  difficulty: String, startupCost: String, estimatedRevenue: String, timeToMVP: String
}, { collection: 'business_opportunities' });

const AgentRunSchema = new mongoose.Schema({
  id: String, userId: String, projectId: String, workflow: String, status: String,
  aiModel: String, provider: String, startedAt: Date, completedAt: Date, durationMs: Number,
  input: mongoose.Schema.Types.Mixed, output: mongoose.Schema.Types.Mixed, error: String
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const FounderProfile = mongoose.model('FounderProfile', FounderProfileSchema);
const BusinessOpportunity = mongoose.model('BusinessOpportunity', BusinessOpportunitySchema);
const AgentRun = mongoose.model('AgentRun', AgentRunSchema);

async function runTest() {
  console.log('--- Opportunity Discovery V1 Integration Test ---');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB.');

  const testUserId = 'test_usr_999';
  const testProjectId = 'test_proj_999';

  // 1. Setup Mock User, Project, FounderProfile
  console.log('Setting up mock database documents...');
  await User.findOneAndUpdate({ id: testUserId }, { email: 'test@creator.com', name: 'Test Founder' }, { upsert: true });
  await Project.findOneAndUpdate({ id: testProjectId }, { userId: testUserId, name: 'Test Project', description: 'Testing Opportunity Discovery', industry: 'SaaS', status: 'draft' }, { upsert: true });
  
  const fp = await FounderProfile.findOneAndUpdate(
    { projectId: testProjectId, userId: testUserId },
    {
      id: 'fp_test_999',
      skills: ['Sales', 'Growth Marketing', 'Product Design'],
      experience: '5 years running small e-commerce stores',
      industryInterests: ['E-commerce', 'AI', 'EdTech'],
      budget: 15000,
      location: 'Egypt',
      availableTime: 'Full Time',
      startupGoals: 'Build a highly scalable cash-flow SaaS',
      riskTolerance: 'Medium',
      teamSize: '1-2 members',
      founderType: 'Hustler Designer',
      strengths: ['Salesmanship', 'Prototyping'],
      weaknesses: ['Advanced Coding', 'Corporate Finance']
    },
    { upsert: true, new: true }
  );

  // 2. Generate JWT Auth Token
  const token = jwt.sign({ id: testUserId, email: 'test@creator.com' }, JWT_SECRET, { expiresIn: '1h' });

  // 3. Clear existing opportunities
  console.log('Clearing old opportunities...');
  await BusinessOpportunity.deleteMany({ projectId: testProjectId, userId: testUserId });

  console.log('Triggering POST /api/opportunities/discover...');
  try {
    const response = await fetch(`${API_URL}/api/opportunities/discover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId: testProjectId })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log('\n--- API Response Received ---');
    console.log(`Success: ${data.success !== false}`);
    console.log(`Opportunities Generated: ${data.opportunities ? data.opportunities.length : 0}`);

    if (data.opportunities && data.opportunities.length > 0) {
      console.log('First Opportunity sample:');
      console.log(JSON.stringify(data.opportunities[0], null, 2));

      // Assertions
      const firstOpp = data.opportunities[0];
      console.log('\n--- Assertions ---');
      console.log(`- startupCost is formatted string: ${firstOpp.startupCost} -> ${typeof firstOpp.startupCost === 'string'}`);
      console.log(`- estimatedRevenue is formatted string: ${firstOpp.estimatedRevenue} -> ${typeof firstOpp.estimatedRevenue === 'string'}`);
      console.log(`- timeToMVP is present: "${firstOpp.timeToMVP}"`);
      console.log(`- id starts with opp_: ${firstOpp.id.startsWith('opp_')}`);

      // Check DB
      console.log('\nChecking MongoDB business_opportunities collection...');
      const dbOpps = await BusinessOpportunity.find({ projectId: testProjectId, userId: testUserId });
      console.log(`- Opportunities saved in DB: ${dbOpps.length}`);

      console.log('Checking MongoDB agent_runs collection...');
      const dbAgentRun = await AgentRun.findOne({ projectId: testProjectId, userId: testUserId, workflow: 'opportunity-discovery' }).sort({ startedAt: -1 });
      if (dbAgentRun) {
        console.log(`- Agent Run status: ${dbAgentRun.status}`);
        console.log(`- Agent Run model logged: ${dbAgentRun.aiModel} (Expected: deepseek-v4-flash)`);
        console.log(`- Agent Run duration: ${dbAgentRun.durationMs}ms`);
      } else {
        console.log('- ERROR: No AgentRun record found in DB.');
      }
    }
  } catch (error) {
    console.error('Test Request Failed:', error);
  } finally {
    // Cleanup
    console.log('\nCleaning up mock data...');
    await User.deleteMany({ id: testUserId });
    await Project.deleteMany({ id: testProjectId });
    await FounderProfile.deleteMany({ projectId: testProjectId, userId: testUserId });
    await BusinessOpportunity.deleteMany({ projectId: testProjectId, userId: testUserId });
    await mongoose.disconnect();
    console.log('DB Connection closed. Test completed.');
  }
}

runTest();
