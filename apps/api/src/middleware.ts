import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '@creator/database';
import dotenv from 'dotenv';

dotenv.config();

function verifyToken(token: string): { id: string; email: string } {
  const secret = process.env.JWT_SECRET || 'secret_key_for_jwt_fallback_only';
  return jwt.verify(token, secret) as { id: string; email: string };
}

export const authMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    const decoded = verifyToken(token);
    (req as any).user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await UserModel.findOne({ id: userId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
