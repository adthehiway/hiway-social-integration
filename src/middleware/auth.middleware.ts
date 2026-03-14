import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      companyId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const companyId = req.headers['x-company-id'] as string;

  if (!apiKey || apiKey !== env.HIWAY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!companyId) {
    return res.status(400).json({ error: 'x-company-id header required' });
  }

  req.companyId = companyId;
  next();
}
