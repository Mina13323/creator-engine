import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware';
import { uploadBufferToStorage } from '@creator/agents';

const router = Router();
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    callback(null, true);
  }
});

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
