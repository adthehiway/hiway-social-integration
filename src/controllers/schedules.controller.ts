import { Request, Response, NextFunction } from 'express';
import { schedulesService } from '../services/schedules.service';

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function createSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Schedules] CREATE company=${req.companyId} name=${req.body.name} platforms=${req.body.platforms?.join(',') || 'none'}`);
    const schedule = await schedulesService.create(req.companyId!, req.body);
    console.log(`[Schedules] CREATED id=${schedule.id} company=${req.companyId}`);
    res.status(201).json(schedule);
  } catch (err) {
    console.error(`[Schedules] CREATE FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function listSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const schedules = await schedulesService.list(req.companyId!);
    console.log(`[Schedules] LIST company=${req.companyId} count=${schedules.length}`);
    res.json(schedules);
  } catch (err) {
    console.error(`[Schedules] LIST FAILED company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function updateSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Schedules] UPDATE id=${paramId(req)} company=${req.companyId}`);
    const schedule = await schedulesService.update(paramId(req), req.companyId!, req.body);
    console.log(`[Schedules] UPDATED id=${paramId(req)} company=${req.companyId}`);
    res.json(schedule);
  } catch (err) {
    console.error(`[Schedules] UPDATE FAILED id=${paramId(req)} company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}

export async function deleteSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`[Schedules] DELETE id=${paramId(req)} company=${req.companyId}`);
    await schedulesService.delete(paramId(req), req.companyId!);
    console.log(`[Schedules] DELETED id=${paramId(req)} company=${req.companyId}`);
    res.status(204).send();
  } catch (err) {
    console.error(`[Schedules] DELETE FAILED id=${paramId(req)} company=${req.companyId} error=${(err as Error).message}`);
    next(err);
  }
}
