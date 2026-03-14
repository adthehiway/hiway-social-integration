import { schedulesService } from '../../../src/services/schedules.service';
import { AppError } from '../../../src/middleware/error.middleware';

describe('SchedulesService', () => {
  beforeEach(() => schedulesService._clear());

  it('creates a schedule', async () => {
    const schedule = await schedulesService.create('company1', {
      name: 'Morning Posts',
      platforms: ['twitter', 'instagram'],
      times: ['09:00', '12:00'],
    });
    expect(schedule.name).toBe('Morning Posts');
    expect(schedule.platforms).toEqual(['twitter', 'instagram']);
    expect(schedule.companyId).toBe('company1');
  });

  it('lists schedules for a company', async () => {
    await schedulesService.create('company1', { name: 'A', platforms: ['twitter'], times: ['09:00'] });
    await schedulesService.create('company2', { name: 'B', platforms: ['twitter'], times: ['09:00'] });
    const list = await schedulesService.list('company1');
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('A');
  });

  it('updates a schedule', async () => {
    const s = await schedulesService.create('company1', { name: 'A', platforms: ['twitter'], times: ['09:00'] });
    const updated = await schedulesService.update(s.id, 'company1', { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    expect(updated.platforms).toEqual(['twitter']);
  });

  it('deletes a schedule', async () => {
    const s = await schedulesService.create('company1', { name: 'A', platforms: ['twitter'], times: ['09:00'] });
    await schedulesService.delete(s.id, 'company1');
    const list = await schedulesService.list('company1');
    expect(list).toHaveLength(0);
  });

  it('throws 404 when updating non-existent schedule', async () => {
    await expect(schedulesService.update('fake', 'company1', { name: 'X' }))
      .rejects.toThrow(AppError);
  });

  it('throws 404 when deleting another company schedule', async () => {
    const s = await schedulesService.create('company1', { name: 'A', platforms: ['twitter'], times: ['09:00'] });
    await expect(schedulesService.delete(s.id, 'company2')).rejects.toThrow(AppError);
  });
});
