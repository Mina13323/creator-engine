import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware';
import { aiRateLimiter } from '../rateLimit';
import { requireCredits } from '../middleware';
import { CREDIT_COSTS, deductCredits } from '../services/creditEngine';
import { 
  VentureStateModel, 
  ExecutionRoadmapModel, 
  FounderProfileModel,
  getProjectContext
} from '@creator/database';
import { runExecutionAgent, runNextActionAgent, buildEgyptContextString } from '@creator/agents';

const router = Router();

// GET current execution roadmap
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.query.projectId as string;
    
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    
    const roadmap = await ExecutionRoadmapModel.findOne({ userId, projectId });
    return res.json({ roadmap: roadmap ? roadmap.toObject() : null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST generate new execution roadmap
router.post('/generate', authMiddleware, aiRateLimiter, requireCredits(CREDIT_COSTS.ROADMAP_GENERATION), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.body;
    
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    
    const ventureState = await VentureStateModel.findOne({ userId, projectId });
    const founderProfile = await FounderProfileModel.findOne({ userId, projectId });
    
    if (!ventureState) return res.status(404).json({ error: 'Venture State not found' });
    
    const egyptMarketContext = await buildEgyptContextString(JSON.stringify(ventureState.toObject()));
    
    const rawRoadmap = await runExecutionAgent({
      ventureState: ventureState.toObject(),
      founderProfile: founderProfile ? founderProfile.toObject() : {},
      egyptMarketContext
    });
    
    if (!rawRoadmap) return res.status(500).json({ error: 'Failed to generate roadmap' });
    
    const roadmapId = `rm_${Date.now()}`;
    const newRoadmap = new ExecutionRoadmapModel({
      id: roadmapId,
      userId,
      projectId,
      ...rawRoadmap
    });
    
    await ExecutionRoadmapModel.deleteMany({ userId, projectId });
    await newRoadmap.save();
    await VentureStateModel.updateOne({ projectId, userId }, { $set: { roadmap: newRoadmap.toObject(), lastUpdated: new Date() } });
    await deductCredits(userId, CREDIT_COSTS.ROADMAP_GENERATION, 'Execution Roadmap Generation');
    
    return res.status(201).json({ roadmap: newRoadmap.toObject() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH update task status
router.patch('/task/:taskId', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { taskId } = req.params;
    const { projectId, status } = req.body;
    
    if (!projectId || !status) return res.status(400).json({ error: 'Missing projectId or status' });
    
    const roadmap = await ExecutionRoadmapModel.findOne({ userId, projectId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    
    let totalTasks = 0;
    let completedTasks = 0;
    let taskFound = false;
    
    roadmap.phases.forEach((phase: any) => {
      phase.tasks.forEach((task: any) => {
        if (task.id === taskId) {
          task.status = status;
          taskFound = true;
        }
        totalTasks++;
        if (task.status === 'done') completedTasks++;
      });
    });
    
    if (!taskFound) return res.status(404).json({ error: 'Task not found' });
    
    roadmap.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    await roadmap.save();
    
    return res.json({ roadmap: roadmap.toObject() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});



// GET smart recommendations
router.get('/recommendations', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.query.projectId as string;
    
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    
    const context = await getProjectContext(projectId, userId);
    const egyptCtx = await buildEgyptContextString(JSON.stringify(context.project || {}));
    
    const recommendations = await runNextActionAgent({
      ventureContext: context,
      egyptMarketContext: egyptCtx
    });
    
    return res.json({ recommendations });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
