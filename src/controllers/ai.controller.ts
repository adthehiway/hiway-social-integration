import { Request, Response, NextFunction } from 'express';
import { ayrshareService } from '../services/ayrshare.service';

export async function generateCaption(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ayrshareService.generateCaption(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function generateHashtags(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ayrshareService.generateHashtags(req.body.post);
    res.json(result);
  } catch (err) { next(err); }
}
