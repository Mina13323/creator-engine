import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '@creator/database';
import { env } from './env';

function verifyToken(token: string): { id: string; email: string } {
  return jwt.verify(token, env.JWT_SECRET) as { id: string; email: string };
}

export const authMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
    if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized: No token provided' } });

    const decoded = verifyToken(token);
    (req as any).user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error: any) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized: Invalid token' } });
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

import { hasEnoughCredits } from './services/creditEngine';
import { UserSubscriptionModel, SubscriptionPlanModel } from '@creator/database';

export const requireCredits = (cost: number) => {
  return async (req: Request, res: Response, next: any) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const hasCredits = await hasEnoughCredits(userId, cost);
      if (!hasCredits) {
        return res.status(402).json({
          error: 'INSUFFICIENT_CREDITS',
          required: cost,
          message: `This action requires ${cost} credits.`
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error validating credits' });
    }
  };
};

export const requireSubscription = (minPlanSlug: string) => {
  return async (req: Request, res: Response, next: any) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const sub = await UserSubscriptionModel.findOne({ userId, status: 'active' });
      if (!sub) {
         return res.status(403).json({ error: 'SUBSCRIPTION_REQUIRED', requiredPlan: minPlanSlug });
      }

      // We could add logic to check hierarchy of plans, but for simplicity we check if sub exists.
      // E.g., Free -> Starter -> Pro -> Agency
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error validating subscription' });
    }
  };
};
