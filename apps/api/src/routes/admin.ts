import { Router, Request, Response } from 'express';
import { 
  UserModel, 
  ProjectModel, 
  AgentRunModel, 
  VentureStateModel 
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
    // Generate traffic data for the last 11 days or ticks
    // For simplicity, we just return an array of dates with sample data for now, 
    // OR we can aggregate. Let's aggregate agent runs per day.
    const traffic = [];
    const now = new Date();
    
    for (let i = 10; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      
      const runs = await AgentRunModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      const logins = await UserModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      traffic.push({
        time: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        logins: logins,
        actions: runs
      });
    }

    return res.json(traffic);
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

// GET /api/admin/projects
router.get('/projects', async (req: Request, res: Response): Promise<any> => {
  try {
    const projects = await ProjectModel.find().sort({ createdAt: -1 });
    return res.json(projects);
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

// Lockdown state accessors (set by index.ts)
let _getLockdown: () => boolean = () => false;
let _setLockdown: (v: boolean) => void = () => {};
export function registerLockdownHandlers(get: () => boolean, set: (v: boolean) => void) {
  _getLockdown = get;
  _setLockdown = set;
}
function getLockdown() { return _getLockdown(); }
function setLockdown(v: boolean) { _setLockdown(v); }

export default router;
