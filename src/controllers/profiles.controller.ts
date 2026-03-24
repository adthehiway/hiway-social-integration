import { Request, Response, NextFunction } from 'express';
import { profilesService } from '../services/profiles.service';

export async function createProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profilesService.create(req.body.companyId, req.body.email);
    res.status(201).json(profile);
  } catch (err) { next(err); }
}

export async function connectAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await profilesService.getConnectUrl(req.companyId!, req.body.platform);
    res.json(result);
  } catch (err) { next(err); }
}

export async function listAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const accounts = await profilesService.listAccounts(req.companyId!);
    res.json(accounts);
  } catch (err) { next(err); }
}

export async function resetProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profilesService.reset(req.companyId!, req.body.email);
    res.json(profile);
  } catch (err) { next(err); }
}

export async function disconnectAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;
    const result = await profilesService.disconnectPlatform(req.companyId!, platform);
    res.json(result);
  } catch (err) { next(err); }
}
