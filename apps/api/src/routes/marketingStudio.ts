import { Router, Request, Response } from 'express';
import { authMiddleware, requireCredits } from '../middleware';
import { runMarketingStudioAgent } from '@creator/agents';
import { MarketingStudioGenerationModel } from '@creator/database';
import { deductCredits } from '../services/creditEngine';

const router = Router();

const VIDEO_GENERATION_COST = 50;

router.post('/generate', authMiddleware, requireCredits(VIDEO_GENERATION_COST), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId, prompt, aspect_ratio, duration, images_list, video_files } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const avatar = images_list && images_list.length > 1 ? images_list[1] : '';
    const productImages = images_list && images_list.length > 0 ? [images_list[0]] : [];
    
    // In real app, video_files would be used if format expects video input

    const generationResult = await runMarketingStudioAgent({
      projectId,
      userId,
      prompt,
      productImages,
      avatar,
      duration: duration || 5,
      ratio: aspect_ratio || '9:16',
      quality: 'high'
    });

    let deducted = 0;
    
    if (generationResult.status !== 'failed') {
      if (generationResult.video) {
        deducted = 50;
      } else if (generationResult.images?.length > 0) {
        deducted = 25;
      } else if (generationResult.script) {
        deducted = 10;
      }
      
      if (deducted > 0) {
        await deductCredits(userId, deducted, 'MARKETING_VIDEO');
      }
    }

    // In a full implementation, if status is PARTIAL_SUCCESS, you return the partial info
    return res.status(200).json({
      ...generationResult,
      url: generationResult.video?.url || (generationResult.images?.length > 0 ? generationResult.images[0].url : undefined),
    });

  } catch (error: any) {
    console.error('Marketing Studio Generate Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { projectId } = req.query;

    const query: any = { userId };
    if (projectId) {
      query.projectId = projectId;
    }

    const history = await MarketingStudioGenerationModel.find(query).sort({ createdAt: -1 }).limit(20);
    
    return res.status(200).json(history);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
