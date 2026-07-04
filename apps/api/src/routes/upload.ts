import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware';
import { uploadBufferToStorage } from '@creator/agents';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';

    // Upload to permanent storage
    const secureUrl = await uploadBufferToStorage(buffer, resourceType);

    return res.status(200).json({ success: true, url: secureUrl });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
