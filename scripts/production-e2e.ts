import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { z } from 'zod';
import {
  AgentRunModel,
  BrandIdentityModel,
  BusinessOpportunityModel,
  BusinessPlanModel,
  ConversationModel,
  CreditTransactionModel,
  CreditWalletModel,
  FinancialForecast,
  FounderProfileModel,
  KnowledgeDocumentModel,
  MarketingCampaignModel,
  PitchDeckModel,
  ProjectModel,
  SelectedOpportunityModel,
  UserModel,
  UserSubscriptionModel,
  VentureStateModel,
  connectDB
} from '@creator/database';
import { financialAgentResponseSchema, brandingAgentResponseSchema, marketingAgentResponseSchema, pitchAgentResponseSchema } from '../apps/api/src/schemas';
import { addCredits } from '../apps/api/src/services/creditEngine';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

type Json = Record<string, any>;

async function request(pathname: string, options: RequestInit = {}, cookie = '') {
  const res = await fetch(`${API_BASE_URL}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {})
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${pathname} failed ${res.status}: ${JSON.stringify(body)}`);
  }
  return { res, body };
}

function cookieFrom(res: Response) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('Authentication cookie was not returned');
  return setCookie.split(';')[0];
}

function uniqueEmail() {
  return `rc-${Date.now()}-${Math.random().toString(16).slice(2)}@creator-engine.test`;
}

async function assertCreditTransaction(userId: string, feature: string) {
  const tx = await CreditTransactionModel.findOne({ userId, feature }).sort({ createdAt: -1 });
  assert(tx, `Missing credit transaction for ${feature}`);
}

async function main() {
  await connectDB(DATABASE_URL);
  const email = uniqueEmail();
  const password = `Rc-${Date.now()}-Strong`;
  const summary: Json = { auth: 'FAIL', agents: 'FAIL', database: 'FAIL', rag: 'FAIL', credits: 'FAIL' };

  const signup = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: 'RC Founder' })
  });
  const cookie = cookieFrom(signup.res);
  const userId = signup.body.user.id;

  assert(await UserModel.findOne({ id: userId }), 'UserModel was not created');
  assert(await CreditWalletModel.findOne({ userId }), 'CreditWallet was not created');
  assert(await UserSubscriptionModel.findOne({ userId, status: 'active' }), 'Free subscription was not created');
  await addCredits(userId, 500, 'topup', 'production-e2e');
  summary.auth = 'PASS';

  const projectResponse = await request('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name: 'RC Venture' })
  }, cookie);
  const projectId = projectResponse.body.projectId;
  const project = await ProjectModel.findOne({ id: projectId, userId });
  assert(project, 'Project ownership was not saved');

  const onboarding = {
    skills: ['Product', 'Sales', 'Automation'],
    experience: 'Senior',
    industryInterests: ['B2B SaaS', 'AI automation'],
    budget: 25000,
    location: 'Cairo, Egypt',
    availableTime: 'Full-time',
    startupGoals: 'Build a profitable AI SaaS company',
    riskTolerance: 'Medium',
    teamSize: 'Solo'
  };

  await request('/api/founder/analyze', {
    method: 'POST',
    body: JSON.stringify({ projectId, data: onboarding })
  }, cookie);
  assert(await FounderProfileModel.findOne({ userId, projectId }), 'FounderProfile was not saved');
  assert((await VentureStateModel.findOne({ userId, projectId }))?.founderProfile, 'VentureState founderProfile was not updated');

  await request('/api/opportunities/discover', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  }, cookie);
  const opportunity = await BusinessOpportunityModel.findOne({ userId, projectId });
  assert(opportunity, 'Opportunities were not saved');

  await request('/api/opportunities/select', {
    method: 'POST',
    body: JSON.stringify({ projectId, opportunityId: opportunity.id })
  }, cookie);
  assert(await SelectedOpportunityModel.findOne({ userId, projectId, opportunityId: opportunity.id }), 'Selected opportunity was not saved');
  assert((await VentureStateModel.findOne({ userId, projectId }))?.selectedOpportunity, 'VentureState selectedOpportunity was not updated');

  const businessPlanRes = await request('/api/business-plan/generate', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  }, cookie);
  assert(await BusinessPlanModel.findOne({ userId, projectId, isLatest: true }), 'Business plan latest document missing');
  assert(businessPlanRes.body.businessPlan, 'Business plan API response missing');

  const financialRes = await request('/api/financial/generate', {
    method: 'POST',
    body: JSON.stringify({ projectId, currency: 'EGP' })
  }, cookie);
  financialAgentResponseSchema.pick({ financial: true }).parse({ financial: financialRes.body.financialForecast });
  assert(await FinancialForecast.findOne({ projectId }), 'Financial forecast was not saved');

  const brandingRes = await request('/api/branding/generate', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  }, cookie);
  brandingAgentResponseSchema.parse(brandingRes.body.brandIdentity);
  assert(await BrandIdentityModel.findOne({ userId, projectId, isLatest: true }), 'Brand identity latest document missing');

  const marketingRes = await request('/api/marketing/generate', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  }, cookie);
  marketingAgentResponseSchema.parse(marketingRes.body.marketingCampaign);
  assert(await MarketingCampaignModel.findOne({ userId, projectId, isLatest: true }), 'Marketing campaign latest document missing');

  const pitchRes = await request('/api/pitch/generate', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  }, cookie);
  pitchAgentResponseSchema.parse(pitchRes.body.pitchDeck);
  assert(await PitchDeckModel.findOne({ userId, projectId, isLatest: true }), 'Pitch deck latest document missing');
  summary.agents = 'PASS';

  for (const model of [BusinessPlanModel, BrandIdentityModel, MarketingCampaignModel, PitchDeckModel]) {
    const duplicates = await model.countDocuments({ userId, projectId, isLatest: true });
    assert.strictEqual(duplicates, 1, `Invalid isLatest count for ${model.modelName}`);
  }
  const state = await VentureStateModel.findOne({ userId, projectId });
  assert(state?.latestBusinessPlan && state.financialForecast && state.branding && state.marketing && state.pitchDeck, 'VentureState missing generated context');
  summary.database = 'PASS';

  for (const feature of ['Founder Analysis', 'Opportunity Discovery', 'Financial Engine', 'Branding', 'Marketing', 'Pitch Deck']) {
    await assertCreditTransaction(userId, feature);
  }
  summary.credits = 'PASS';

  const pdfPath = process.env.TEST_PDF_PATH || path.resolve(process.cwd(), 'scripts', 'fixtures', 'rc-upload.pdf');
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`TEST_PDF_PATH is required and must point to a real PDF. Missing: ${pdfPath}`);
  }
  const fileBase64 = fs.readFileSync(pdfPath).toString('base64');
  const uploadRes = await request(`/api/projects/${projectId}/documents/upload`, {
    method: 'POST',
    body: JSON.stringify({
      fileName: path.basename(pdfPath),
      fileType: 'application/pdf',
      fileSize: fs.statSync(pdfPath).size,
      storageUrl: 'https://storage.creator-engine.local/rc-upload.pdf',
      fileBase64
    })
  }, cookie);
  assert.strictEqual(uploadRes.body.document.processingStatus, 'completed', 'PDF processing did not complete');
  assert(await KnowledgeDocumentModel.findOne({ userId, projectId, documentId: uploadRes.body.document.id }), 'Vector chunks were not inserted');

  const chatRes = await request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ projectId, message: 'Using my uploaded document and current venture context, what should I prioritize next?' })
  }, cookie);
  assert(chatRes.body.aiResponse?.message, 'AI consultant did not answer');
  assert(await ConversationModel.findOne({ userId, projectId }), 'Conversation was not saved');
  summary.rag = 'PASS';

  assert(await AgentRunModel.findOne({ userId, projectId, workflow: 'document-processing', status: 'success' }), 'Document processing agent run missing');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    auth: 'FAIL',
    agents: 'FAIL',
    database: 'FAIL',
    rag: 'FAIL',
    credits: 'FAIL',
    error: error.message
  }, null, 2));
  process.exit(1);
});
