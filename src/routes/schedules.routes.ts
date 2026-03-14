import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createScheduleSchema, updateScheduleSchema } from '../types';
import * as ctrl from '../controllers/schedules.controller';

const router = Router();

router.post('/', validate(createScheduleSchema), ctrl.createSchedule);
router.get('/', ctrl.listSchedules);
router.put('/:id', validate(updateScheduleSchema), ctrl.updateSchedule);
router.delete('/:id', ctrl.deleteSchedule);

export default router;
