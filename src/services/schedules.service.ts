import { AppError } from '../middleware/error.middleware';
import { CreateScheduleInput, UpdateScheduleInput } from '../types';

interface Schedule {
  id: string;
  companyId: string;
  name: string;
  platforms: string[];
  times: string[];
  createdAt: Date;
}

// In-memory store — swap with DB table if persistence is needed
const schedules = new Map<string, Schedule>();
let counter = 0;

export class SchedulesService {
  async create(companyId: string, input: CreateScheduleInput): Promise<Schedule> {
    const id = `sched_${++counter}`;
    const schedule: Schedule = {
      id,
      companyId,
      name: input.name,
      platforms: input.platforms,
      times: input.times,
      createdAt: new Date(),
    };
    schedules.set(id, schedule);
    return schedule;
  }

  async list(companyId: string): Promise<Schedule[]> {
    return Array.from(schedules.values()).filter((s) => s.companyId === companyId);
  }

  async update(id: string, companyId: string, input: UpdateScheduleInput): Promise<Schedule> {
    const schedule = schedules.get(id);
    if (!schedule || schedule.companyId !== companyId) {
      throw new AppError(404, 'Schedule not found');
    }
    if (input.name) schedule.name = input.name;
    if (input.platforms) schedule.platforms = input.platforms;
    if (input.times) schedule.times = input.times;
    return schedule;
  }

  async delete(id: string, companyId: string): Promise<void> {
    const schedule = schedules.get(id);
    if (!schedule || schedule.companyId !== companyId) {
      throw new AppError(404, 'Schedule not found');
    }
    schedules.delete(id);
  }

  // For testing
  _clear() {
    schedules.clear();
    counter = 0;
  }
}

export const schedulesService = new SchedulesService();
