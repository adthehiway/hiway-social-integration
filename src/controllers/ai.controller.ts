import { Request, Response, NextFunction } from 'express';
import { ayrshareService } from '../services/ayrshare.service';

export async function generateCaption(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[AI] GENERATE CAPTION company=${req.companyId}`);
    const result = await ayrshareService.generateCaption(req.body);
    console.log(`[AI] CAPTION GENERATED company=${req.companyId}`);
    res.json(result);
  } catch (err) {
    console.error(`[AI] GENERATE CAPTION FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function generateHashtags(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[AI] GENERATE HASHTAGS company=${req.companyId}`);
    const result = await ayrshareService.generateHashtags(req.body.post);
    console.log(`[AI] HASHTAGS GENERATED company=${req.companyId}`);
    res.json(result);
  } catch (err) {
    console.error(`[AI] GENERATE HASHTAGS FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}
