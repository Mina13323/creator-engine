import mongoose from 'mongoose';
import { Router, Request, Response } from 'express';
import { 
  UserModel, 
  ProjectModel, 
  AgentRunModel, 
  VentureStateModel,
  UserSubscriptionModel,
  SubscriptionPlanModel,
  SelectedOpportunityModel,
  BusinessOpportunityModel,
  BusinessValidationModel,
  BusinessModelModel,
  BusinessPlanModel,
  BrandIdentityModel,
  MarketingCampaignModel,
  PitchDeckModel,
  ExecutionRoadmapModel,
  ConversationModel,
  UploadedDocumentModel,
  KnowledgeDocumentModel,
  AdminSettingsModel,
  AdminSettings,
  PaymentTransactionModel
} from '@creator/database';
import { authMiddleware, adminMiddleware } from '../middleware';

const router = Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response): Promise<any> => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalProjects = await ProjectModel.countDocuments();
    const agentRuns = await AgentRunModel.countDocuments();
    
    // Calculate success rate of agents
    const successfulRuns = await AgentRunModel.countDocuments({ status: 'success' });
    const successRate = agentRuns > 0 ? Math.round((successfulRuns / agentRuns) * 100) : 100;

    const flaggedProjects = await ProjectModel.countDocuments({ isFlagged: true });
    
    // DB is connected if we get here
    return res.json({
      activeUsers: totalUsers,
      totalProjects,
      agentRuns,
      successRate,
      flaggedContent: flaggedProjects,
      reportsToday: flaggedProjects, // Just reusing for now
      actionsTaken: 0,
      systemHealth: '100%'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/traffic
router.get('/traffic', async (req: Request, res: Response): Promise<any> => {
  try {
    const offset = Number(req.query.offset) || 0;
    const now = new Date();
    
    const startOffset = 10 + offset;
    const endOffset = offset;
    
    const dStart = new Date(now);
    dStart.setDate(dStart.getDate() - startOffset);
    dStart.setHours(0,0,0,0);
    
    const dEnd = new Date(now);
    dEnd.setDate(dEnd.getDate() - endOffset);
    dEnd.setHours(23,59,59,999);

    const [runs, users, projects] = await Promise.all([
      AgentRunModel.find({
        createdAt: { $gte: dStart, $lte: dEnd }
      }, { createdAt: 1 }).lean(),
      UserModel.find({
        createdAt: { $gte: dStart, $lte: dEnd }
      }, { createdAt: 1 }).lean(),
      ProjectModel.find({
        createdAt: { $gte: dStart, $lte: dEnd }
      }, { name: 1, createdAt: 1 }).lean()
    ]);

    const traffic = [];
    for (let i = 10; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i - offset);
      const startOfDay = new Date(d.setHours(0,0,0,0)).getTime();
      const endOfDay = new Date(d.setHours(23,59,59,999)).getTime();

      const runsInDay = runs.filter(r => {
        const t = new Date(r.createdAt).getTime();
        return t >= startOfDay && t <= endOfDay;
      });
      const usersInDay = users.filter(u => {
        const t = new Date(u.createdAt).getTime();
        return t >= startOfDay && t <= endOfDay;
      });
      const projectsInDay = projects.filter(p => {
        const t = new Date(p.createdAt).getTime();
        return t >= startOfDay && t <= endOfDay;
      });

      const runsCount = runsInDay.length;
      const signupsCount = usersInDay.length;
      const loginsCount = signupsCount * 2 + (runsCount > 0 ? 1 : 0);
      const projectNames = projectsInDay.map(p => p.name || 'Unnamed Project');
      
      const startOfDayDate = new Date(startOfDay);
      const dayLabel = startOfDayDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dateLabel = startOfDayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      traffic.push({
        time: `${dayLabel} (${dateLabel})`,
        signups: signupsCount,
        logins: loginsCount,
        actions: runsCount,
        projectsCount: projectsInDay.length,
        projectNames: projectNames
      });
    }

    return res.json(traffic);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});// GET /api/admin/feed
router.get('/feed', async (req: Request, res: Response): Promise<any> => {
  try {
    const events = [];

    // 1. Fetch recent projects
    const projects = await ProjectModel.find().sort({ createdAt: -1 }).limit(10);
    for (const p of projects) {
      events.push({
        id: p.id,
        type: p.isFlagged ? 'Flagged Project' : 'New Project',
        user: p.userId || 'system',
        status: p.isFlagged ? 'Pending' : 'Resolved',
        timestamp: p.createdAt,
        details: `Project "${p.name}" created`
      });
    }

    // 2. Fetch recent agent runs
    const runs = await AgentRunModel.find().sort({ createdAt: -1 }).limit(10);
    for (const r of runs) {
      events.push({
        id: r._id.toString(),
        type: 'Agent Execution',
        user: r.userId || 'system',
        status: r.status === 'completed' ? 'Resolved' : r.status === 'failed' ? 'Failed' : 'Pending',
        timestamp: r.createdAt,
        details: `Agent ${r.agentType || 'Co-Founder'} run ${r.status}`
      });
    }

    // 3. Fetch recent users
    const users = await UserModel.find().sort({ createdAt: -1 }).limit(10);
    for (const u of users) {
      events.push({
        id: u.id,
        type: 'User Signup',
        user: u.email,
        status: u.isBanned ? 'Banned' : 'Resolved',
        timestamp: u.createdAt,
        details: `User "${u.name || u.email}" signed up`
      });
    }

    // Sort all events by timestamp descending
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json(events.slice(0, 15));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/users/:userId/ban
router.post('/users/:userId/ban', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { ban } = req.body;
    const user = await UserModel.findOneAndUpdate({ id: userId }, { isBanned: !!ban }, { new: true });
    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/users/:userId/role
router.post('/users/:userId/role', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await UserModel.findOneAndUpdate({ id: userId }, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findOneAndDelete({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Clean up related data
    await ProjectModel.deleteMany({ userId });
    await UserSubscriptionModel.deleteMany({ userId });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/projects
router.get('/projects', async (req: Request, res: Response): Promise<any> => {
  try {
    const projects = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    
    // Get unique user IDs
    const userIds = Array.from(new Set(projects.map(p => p.userId).filter(Boolean)));
    
    // Fetch users in parallel
    const users = await UserModel.find({ id: { $in: userIds } }).lean();
    const userMap = new Map(users.map(u => [u.id, u]));
    
    // Fetch active subscriptions for these users
    const subscriptions = await UserSubscriptionModel.find({ userId: { $in: userIds }, status: 'active' }).lean();
    const subMap = new Map(subscriptions.map(s => [s.userId, s]));
    
    // Get unique plan IDs from subscriptions
    const planIds = Array.from(new Set(subscriptions.map(s => s.planId).filter(Boolean)));
    
    // Fetch plans
    const validPlanObjectIds = planIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const plans = await SubscriptionPlanModel.find({
      $or: [
        { slug: { $in: planIds } },
        { _id: { $in: validPlanObjectIds } }
      ]
    }).lean();
    
    const planMap = new Map();
    plans.forEach(p => {
      planMap.set((p as any)._id.toString(), p);
      if ((p as any).slug) {
        planMap.set((p as any).slug, p);
      }
    });
    
    const populatedProjects = projects.map((project) => {
      const user = userMap.get(project.userId) as any;
      let planName = 'Free';
      if (user) {
        const sub = subMap.get(user.id) as any;
        if (sub) {
          const plan = planMap.get(sub.planId.toString()) as any;
          if (plan) {
            planName = plan.name;
          }
        }
      }
      return {
        ...project,
        creator: user ? { id: user.id, name: user.name, email: user.email } : null,
        plan: planName,
      };
    });

    return res.json(populatedProjects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/projects/:projectId
router.put('/projects/:projectId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    const { name, description, industry, status, isFlagged, flagReason } = req.body;
    
    const project = await ProjectModel.findOneAndUpdate(
      { id: projectId },
      { name, description, industry, status, isFlagged, flagReason },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ success: true, project });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/projects/:projectId
router.delete('/projects/:projectId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    const project = await ProjectModel.findOneAndDelete({ id: projectId });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Cascade deletion to all related schemas
    await SelectedOpportunityModel.deleteMany({ projectId });
    await BusinessOpportunityModel.deleteMany({ projectId });
    await BusinessValidationModel.deleteMany({ projectId });
    await BusinessModelModel.deleteMany({ projectId });
    await BusinessPlanModel.deleteMany({ projectId });
    await BrandIdentityModel.deleteMany({ projectId });
    await MarketingCampaignModel.deleteMany({ projectId });
    await PitchDeckModel.deleteMany({ projectId });
    await ExecutionRoadmapModel.deleteMany({ projectId });
    await ConversationModel.deleteMany({ projectId });
    await VentureStateModel.deleteMany({ projectId });
    await AgentRunModel.deleteMany({ projectId });
    await UploadedDocumentModel.deleteMany({ projectId });
    await KnowledgeDocumentModel.deleteMany({ projectId });

    return res.json({ success: true, message: 'Project and all related data deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/projects/:projectId/flag
router.post('/projects/:projectId/flag', async (req: Request, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    const { flag, reason } = req.body;
    const project = await ProjectModel.findOneAndUpdate(
      { id: projectId }, 
      { isFlagged: !!flag, flagReason: reason || '' }, 
      { new: true }
    );
    return res.json({ success: true, project });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/lockdown — returns current lockdown state
router.get('/lockdown', (req: Request, res: Response) => {
  res.json({ lockdown: getLockdown() });
});

// POST /api/admin/lockdown — toggle lockdown { active: true | false }
router.post('/lockdown', (req: Request, res: Response) => {
  const { active } = req.body;
  setLockdown(!!active);
  res.json({ lockdown: getLockdown(), message: getLockdown() ? 'Lockdown activated.' : 'Lockdown deactivated.' });
});

// GET /api/admin/agent-runs — returns recent agent runs with token telemetry
router.get('/agent-runs', async (req: Request, res: Response): Promise<any> => {
  try {
    const runs = await AgentRunModel.find().sort({ createdAt: -1 }).limit(50).lean();
    return res.json(runs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/observability/stats — returns total tokens and workflow summaries
router.get('/observability/stats', async (req: Request, res: Response): Promise<any> => {
  try {
    const aggregateResult = await AgentRunModel.aggregate([
      {
        $group: {
          _id: null,
          totalPromptTokens: { $sum: { $ifNull: ['$promptTokens', 0] } },
          totalCompletionTokens: { $sum: { $ifNull: ['$completionTokens', 0] } },
          totalTokens: { $sum: { $ifNull: ['$totalTokens', 0] } },
          totalRuns: { $sum: 1 }
        }
      }
    ]);

    const breakdownResult = await AgentRunModel.aggregate([
      {
        $group: {
          _id: '$workflow',
          count: { $sum: 1 },
          tokens: { $sum: { $ifNull: ['$totalTokens', 0] } }
        }
      }
    ]);

    const stats = aggregateResult[0] || {
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      totalRuns: 0
    };

    const averageTokens = stats.totalRuns > 0 ? Math.round(stats.totalTokens / stats.totalRuns) : 0;

    const workflowBreakdown: Record<string, { count: number; tokens: number }> = {};
    breakdownResult.forEach((item: any) => {
      if (item._id) {
        workflowBreakdown[item._id] = {
          count: item.count,
          tokens: item.tokens
        };
      }
    });

    return res.json({
      totalPromptTokens: stats.totalPromptTokens,
      totalCompletionTokens: stats.totalCompletionTokens,
      totalTokens: stats.totalTokens,
      averageTokens,
      totalRuns: stats.totalRuns,
      workflowBreakdown
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/settings — retrieve global system settings
router.get('/settings', async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await AdminSettingsModel.findOne({ key: 'global_config' }).lean();
    if (!settings) {
      const defaultSettings = new AdminSettingsModel({
        key: 'global_config',
        defaultModel: 'deepseek-v4-flash',
        aiTemperature: 0.7,
        maxTokensPerRun: 150000,
        freeCredits: 50,
        maxProjects: 5,
        lockdown: getLockdown(),
        maintenance: false,
        flagAlerts: true,
        weeklyReports: false
      });
      await defaultSettings.save();
      settings = defaultSettings.toObject();
    }
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/settings — update global system settings
router.post('/settings', async (req: Request, res: Response): Promise<any> => {
  try {
    const updateFields = req.body;
    delete updateFields._id;
    delete updateFields.key;
    delete updateFields.createdAt;
    delete updateFields.updatedAt;

    const settings = await AdminSettingsModel.findOneAndUpdate(
      { key: 'global_config' },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    if (updateFields.lockdown !== undefined) {
      setLockdown(updateFields.lockdown);
    }
    if (updateFields.maintenance !== undefined) {
      setMaintenance(updateFields.maintenance);
    }

    return res.json({ success: true, settings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/plans — returns all subscription plans
router.get('/plans', async (req: Request, res: Response): Promise<any> => {
  try {
    const plans = await SubscriptionPlanModel.find().sort({ monthlyPriceEGP: 1 }).lean();
    return res.json(plans);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/plans — creates a new plan
router.post('/plans', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, monthlyPriceEGP, monthlyCredits, maxProjects, features, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const existing = await SubscriptionPlanModel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'A plan with this name already exists' });
    }

    const plan = new SubscriptionPlanModel({
      name,
      slug,
      monthlyPriceEGP,
      monthlyCredits,
      maxProjects,
      features: features || [],
      isActive: isActive !== false
    });
    await plan.save();
    return res.json({ success: true, plan });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/plans/:planId — updates plan details
router.put('/plans/:planId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { planId } = req.params;
    const { name, monthlyPriceEGP, monthlyCredits, maxProjects, features, isActive } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const plan = await SubscriptionPlanModel.findByIdAndUpdate(
      planId,
      { name, slug, monthlyPriceEGP, monthlyCredits, maxProjects, features, isActive },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    return res.json({ success: true, plan });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/plans/:planId — deletes a plan if not in use
router.delete('/plans/:planId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { planId } = req.params;
    
    // Safeguard check
    const activeUsersCount = await UserSubscriptionModel.countDocuments({ planId, status: 'active' });
    if (activeUsersCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete plan. There are ${activeUsersCount} users currently subscribed to this plan.` 
      });
    }

    const plan = await SubscriptionPlanModel.findByIdAndDelete(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    return res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Lockdown state accessors (set by index.ts)
let _getLockdown: () => boolean = () => false;
let _setLockdown: (v: boolean) => void = () => {};
export function registerLockdownHandlers(get: () => boolean, set: (v: boolean) => void) {
  _getLockdown = get;
  _setLockdown = set;
}
function getLockdown() { return _getLockdown(); }
function setLockdown(v: boolean) { _setLockdown(v); }

let _setMaintenance: (v: boolean) => void = () => {};
export function registerMaintenanceHandlers(get: () => boolean, set: (v: boolean) => void) {
  _setMaintenance = set;
}
function setMaintenance(v: boolean) { _setMaintenance(v); }

// GET /api/admin/dashboard-extended
router.get('/dashboard-extended', async (req: Request, res: Response): Promise<any> => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalProjects = await ProjectModel.countDocuments();
    const agentRuns = await AgentRunModel.countDocuments();

    // 1. Project Status breakdown
    const statusAggregate = await ProjectModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const projectsStatus: Record<string, number> = {
      draft: 0,
      idea: 0,
      validated: 0,
      branded: 0,
      'marketing-ready': 0,
      active: 0,
      archived: 0
    };
    statusAggregate.forEach((item: any) => {
      if (item._id && projectsStatus[item._id] !== undefined) {
        projectsStatus[item._id] = item.count;
      }
    });

    // 2. Revenue & Billing aggregation
    const revenueAggregate = await PaymentTransactionModel.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountEGP' } } }
    ]);
    const totalRevenue = revenueAggregate[0]?.total || 0;

    const subscriptionAggregate = await UserSubscriptionModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$planId', count: { $sum: 1 } } }
    ]);
    const subscriptionDistribution: Record<string, number> = {
      free: 0,
      starter: 0,
      pro: 0,
      agency: 0
    };
    subscriptionAggregate.forEach((item: any) => {
      if (item._id) {
        const lowerId = item._id.toLowerCase();
        subscriptionDistribution[lowerId] = item.count;
      }
    });

    // 3. Recent payment logs (with user name/email)
    const payments = await PaymentTransactionModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const userIds = Array.from(new Set(payments.map(tx => tx.userId).filter(Boolean)));
    const users = await UserModel.find({ id: { $in: userIds } }).lean();
    const userMap = new Map(users.map(u => [u.id, u]));

    const populatedPayments = payments.map((tx: any) => {
      const user = userMap.get(tx.userId) as any;
      return {
        id: tx._id ? tx._id.toString() : tx.paymentIntentId,
        userId: tx.userId,
        amountEGP: tx.amountEGP,
        paymentProvider: tx.paymentProvider,
        paymentIntentId: tx.paymentIntentId,
        status: tx.status,
        metadata: tx.metadata || {},
        createdAt: tx.createdAt || new Date(),
        creator: user ? { name: user.name, email: user.email } : null
      };
    });

    // 4. Agent runs stats
    const agentStats = await AgentRunModel.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: { $ifNull: ['$totalTokens', 0] } },
          totalPromptTokens: { $sum: { $ifNull: ['$promptTokens', 0] } },
          totalCompletionTokens: { $sum: { $ifNull: ['$completionTokens', 0] } },
          totalRuns: { $sum: 1 },
          successfulRuns: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
            }
          },
          totalDuration: { $sum: { $ifNull: ['$durationMs', 0] } },
          durationCount: {
            $sum: {
              $cond: [{ $gt: [{ $ifNull: ['$durationMs', 0] }, 0] }, 1, 0]
            }
          }
        }
      }
    ]);
    const obs = agentStats[0] || {
      totalTokens: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalRuns: 0,
      successfulRuns: 0,
      totalDuration: 0,
      durationCount: 0
    };
    const averageLatencyMs = obs.durationCount > 0 ? Math.round(obs.totalDuration / obs.durationCount) : 0;
    const successRate = obs.totalRuns > 0 ? Math.round((obs.successfulRuns / obs.totalRuns) * 100) : 100;

    // 5. System settings config
    let settings: any = await AdminSettingsModel.findOne({ key: 'global_config' }).lean();
    if (!settings) {
      settings = {
        defaultModel: 'deepseek-v4-flash',
        aiTemperature: 0.7,
        maxTokensPerRun: 150000,
        freeCredits: 50,
        maxProjects: 5,
        lockdown: getLockdown(),
        maintenance: false,
        flagAlerts: true,
        weeklyReports: false
      };
    }

    return res.json({
      activeUsers: totalUsers,
      totalProjects,
      agentRuns,
      projectsStatus,
      totalRevenue,
      subscriptionDistribution,
      recentPayments: populatedPayments,
      flaggedContent: await ProjectModel.countDocuments({ isFlagged: true }),
      observability: {
        totalTokens: obs.totalTokens,
        totalPromptTokens: obs.totalPromptTokens,
        totalCompletionTokens: obs.totalCompletionTokens,
        totalRuns: obs.totalRuns,
        successfulRuns: obs.successfulRuns,
        successRate,
        averageLatencyMs
      },
      settings: {
        ...settings,
        lockdown: getLockdown(),
        maintenance: (settings as any).maintenance || false
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
