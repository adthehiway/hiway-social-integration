import { Request, Response, NextFunction } from 'express';
import { schedulesService } from '../services/schedules.service';

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function createSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await schedulesService.create(req.companyId!, req.body);
    res.status(201).json(schedule);
  } catch (err) { next(err); }
}

export async function listSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const schedules = await schedulesService.list(req.companyId!);
    res.json(schedules);
  } catch (err) { next(err); }
}

export async function updateSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const schedule = await schedulesService.update(paramId(req), req.companyId!, req.body);
    res.json(schedule);
  } catch (err) { next(err); }
}

export async function deleteSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    await schedulesService.delete(paramId(req), req.companyId!);
    res.status(204).send();
  } catch (err) { next(err); }
}
