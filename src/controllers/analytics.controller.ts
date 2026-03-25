import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ayrshareService } from '../services/ayrshare.service';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Platforms that support Ayrshare analytics
const ANALYTICS_PLATFORMS = [
  'bluesky', 'facebook', 'gmb', 'instagram', 'linkedin',
  'pinterest', 'reddit', 'snapchat', 'threads', 'tiktok',
  'twitter', 'youtube',
];

async function getProfileKey(companyId: string): Promise<string> {
  const profile = await prisma.ayrshareProfile.findUnique({ where: { companyId } });
  if (!profile) throw new AppError(404, 'No profile for this company');
  return profile.profileKey;
}

function filterAnalyticsPlatforms(platforms: string[]): string[] {
  return platforms.filter((p: string) => ANALYTICS_PLATFORMS.includes(p.toLowerCase()));
}

export async function getPostAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const profileKey = await getProfileKey(req.companyId!);
    const { id, platforms } = req.body;
    if (!id) throw new AppError(400, 'Post id is required');
    console.log(`[Analytics] POST ANALYTICS company=${req.companyId} postId=${id} platforms=${platforms?.join(',') || 'all'}`);
    const data = await ayrshareService.getPostAnalytics({
      id,
      platforms,
      profileKey,
    });
    console.log(`[Analytics] POST ANALYTICS OK company=${req.companyId} postId=${id}`);
    res.json(data);
  } catch (err) {
    console.error(`[Analytics] POST ANALYTICS FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function getSocialAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const profileKey = await getProfileKey(req.companyId!);
    const { platforms, quarters, daily } = req.body;
    if (!platforms || !platforms.length) throw new AppError(400, 'platforms array is required');
    const supported = filterAnalyticsPlatforms(platforms);
    if (!supported.length) throw new AppError(400, 'None of the requested platforms support analytics');
    console.log(`[Analytics] SOCIAL ANALYTICS company=${req.companyId} platforms=${supported.join(',')}`);
    const data = await ayrshareService.getSocialAnalytics({
      platforms: supported,
      profileKey,
      quarters,
      daily,
    });
    console.log(`[Analytics] SOCIAL ANALYTICS OK company=${req.companyId}`);
    res.json(data);
  } catch (err) {
    console.error(`[Analytics] SOCIAL ANALYTICS FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function getPostHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const profileKey = await getProfileKey(req.companyId!);
    const lastDays = req.query.lastDays ? parseInt(req.query.lastDays as string) : undefined;
    const lastRecords = req.query.lastRecords ? parseInt(req.query.lastRecords as string) : undefined;
    console.log(`[Analytics] POST HISTORY company=${req.companyId} lastDays=${lastDays || 'all'} lastRecords=${lastRecords || 'all'}`);
    const data = await ayrshareService.getPostHistory({
      profileKey,
      lastDays,
      lastRecords,
    });
    console.log(`[Analytics] POST HISTORY OK company=${req.companyId}`);
    res.json(data);
  } catch (err) {
    console.error(`[Analytics] POST HISTORY FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}
