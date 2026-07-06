import express from 'react'; // Ignore react import, using express
import { Request, Response, Router } from 'express';
import { BuilderService } from '../services/builderService';

export const builderRouter = Router();

builderRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, ventureId, businessIdea } = req.body;
    
    // Dynamic context based on user's current project
    const input = {
      userPrompt: prompt,
      ventureContext: { name: businessIdea || 'My Startup', industry: 'Technology' },
      brandIdentity: { colors: { primary: '#000000', secondary: '#ffffff' } },
      businessPlan: { pages: ['Home', 'About'], features: ['Authentication', 'Dashboard'] }
    };

    const project = await BuilderService.generateProject('user1', ventureId || 'v1', businessIdea || 'AI Website', input);
    
    res.json({ success: true, projectId: project.id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

builderRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ success: false, error: 'projectId is required' });
    }

    const status = await BuilderService.getProjectStatus(projectId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
