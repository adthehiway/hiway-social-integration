import { Request, Response, NextFunction } from 'express';
import { profilesService } from '../services/profiles.service';

export async function createProfile(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Profiles] CREATE company=${req.body.companyId}`);
    const profile = await profilesService.create(req.body.companyId, req.body.email);
    console.log(`[Profiles] CREATED company=${req.body.companyId} profileKey=${profile.profileKey ? '***set***' : 'MISSING'}`);
    res.status(201).json(profile);
  } catch (err) {
    console.error(`[Profiles] CREATE FAILED company=${req.body.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function connectAccount(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Profiles] CONNECT company=${req.companyId} platform=${req.body.platform}`);
    const result = await profilesService.getConnectUrl(req.companyId!, req.body.platform);
    console.log(`[Profiles] CONNECT URL generated company=${req.companyId} platform=${req.body.platform}`);
    res.json(result);
  } catch (err) {
    console.error(`[Profiles] CONNECT FAILED company=${req.companyId} platform=${req.body.platform} error=${(err as Error).message}`);
    next(err);
  }
}

export async function listAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const accounts = await profilesService.listAccounts(req.companyId!);
    console.log(`[Profiles] LIST ACCOUNTS company=${req.companyId} count=${Array.isArray(accounts) ? accounts.length : 'n/a'}`);
    res.json(accounts);
  } catch (err) {
    console.error(`[Profiles] LIST ACCOUNTS FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function resetProfile(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Profiles] RESET company=${req.companyId}`);
    const profile = await profilesService.reset(req.companyId!, req.body.email);
    console.log(`[Profiles] RESET DONE company=${req.companyId}`);
    res.json(profile);
  } catch (err) {
    console.error(`[Profiles] RESET FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function disconnectAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;
    console.log(`[Profiles] DISCONNECT company=${req.companyId} platform=${platform}`);
    const result = await profilesService.disconnectPlatform(req.companyId!, platform);
    console.log(`[Profiles] DISCONNECTED company=${req.companyId} platform=${platform}`);
    res.json(result);
  } catch (err) {
    console.error(`[Profiles] DISCONNECT FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}
