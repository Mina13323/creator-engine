import assert from 'assert';
import {
  BrandIdentityModel,
  BusinessOpportunityModel,
  BusinessPlanModel,
  CreditWalletModel,
  FounderProfileModel,
  MarketingCampaignModel,
  PitchDeckModel,
  ProjectModel,
  SelectedOpportunityModel,
  UserModel,
  UserSubscriptionModel,
  VentureStateModel,
  connectDB
} from '@creator/database';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

type AuditIssue = {
  check: string;
  detail: string;
};

const issues: AuditIssue[] = [];

function record(check: string, detail: string) {
  issues.push({ check, detail });
}

async function ensureNoProjectsWithoutOwners() {
  const projects = await ProjectModel.find({}, { id: 1, userId: 1 }).lean();
  const userIds = new Set((await UserModel.find({}, { id: 1 }).lean()).map((user: any) => user.id));
  for (const project of projects) {
    if (!userIds.has(project.userId)) {
      record('project-owner', `Project ${project.id} references missing user ${project.userId}`);
    }
  }
}

async function ensureUsersHaveWalletsAndSubscriptions() {
  const users = await UserModel.find({}, { id: 1 }).lean();
  for (const user of users as any[]) {
    const [wallet, subscription] = await Promise.all([
      CreditWalletModel.findOne({ userId: user.id }).lean(),
      UserSubscriptionModel.findOne({ userId: user.id, status: 'active' }).lean()
    ]);
    if (!wallet) record('wallet', `User ${user.id} has no credit wallet`);
    if (!subscription) record('subscription', `User ${user.id} has no active subscription`);
  }
}

async function ensureNoOrphans() {
  const projects = await ProjectModel.find({}, { id: 1, userId: 1 }).lean();
  const projectKeys = new Set(projects.map((project: any) => `${project.userId}:${project.id}`));
  const scopedModels = [
    FounderProfileModel,
    BusinessOpportunityModel,
    SelectedOpportunityModel,
    BusinessPlanModel,
    BrandIdentityModel,
    MarketingCampaignModel,
    PitchDeckModel,
    VentureStateModel
  ];

  for (const model of scopedModels) {
    const docs = await model.find({}, { id: 1, userId: 1, projectId: 1 }).lean();
    for (const doc of docs as any[]) {
      if (!projectKeys.has(`${doc.userId}:${doc.projectId}`)) {
        record('orphan', `${model.modelName} ${doc.id || doc._id} references missing project ${doc.projectId} for user ${doc.userId}`);
      }
    }
  }
}

async function ensureSingleLatest() {
  const latestModels = [BusinessPlanModel, BrandIdentityModel, MarketingCampaignModel, PitchDeckModel];
  for (const model of latestModels) {
    const duplicates = await model.aggregate([
      { $match: { isLatest: true } },
      { $group: { _id: { userId: '$userId', projectId: '$projectId' }, count: { $sum: 1 }, ids: { $push: '$id' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    for (const duplicate of duplicates) {
      record('duplicate-latest', `${model.modelName} has ${duplicate.count} latest docs for ${duplicate._id.userId}/${duplicate._id.projectId}: ${duplicate.ids.join(', ')}`);
    }
  }
}

async function ensureIndexes() {
  const checks: Array<[any, string[]]> = [
    [UserModel, ['id_1', 'email_1', 'createdAt_-1']],
    [ProjectModel, ['id_1', 'userId_1_status_1', 'createdAt_-1']],
    [BusinessPlanModel, ['projectId_1_userId_1', 'projectId_1_userId_1_isLatest_1']],
    [BrandIdentityModel, ['projectId_1_userId_1', 'projectId_1_userId_1_isLatest_1']],
    [MarketingCampaignModel, ['projectId_1_userId_1', 'projectId_1_userId_1_isLatest_1']],
    [PitchDeckModel, ['projectId_1_userId_1', 'projectId_1_userId_1_isLatest_1']],
    [CreditWalletModel, ['userId_1']],
    [UserSubscriptionModel, ['userId_1_status_1']]
  ];

  for (const [model, requiredIndexes] of checks) {
    const indexes = await model.collection.indexes();
    const names = new Set(indexes.map((index: any) => index.name));
    for (const requiredIndex of requiredIndexes) {
      if (!names.has(requiredIndex)) {
        record('index', `${model.modelName} missing index ${requiredIndex}`);
      }
    }
  }
}

async function main() {
  await connectDB(DATABASE_URL);
  await ensureNoProjectsWithoutOwners();
  await ensureUsersHaveWalletsAndSubscriptions();
  await ensureNoOrphans();
  await ensureSingleLatest();
  await ensureIndexes();

  const result = {
    status: issues.length === 0 ? 'PASS' : 'FAIL',
    issues
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  assert.strictEqual(issues.length, 0, 'Database audit failed');
}

main().catch((error) => {
  console.error(JSON.stringify({ status: 'FAIL', error: error.message, issues }, null, 2));
  process.exit(1);
});
