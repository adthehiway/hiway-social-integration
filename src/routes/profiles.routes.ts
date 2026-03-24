import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createProfileSchema, resetProfileSchema } from '../types';
import * as ctrl from '../controllers/profiles.controller';

const router = Router();

router.post('/', validate(createProfileSchema), ctrl.createProfile);
router.post('/reset', validate(resetProfileSchema), ctrl.resetProfile);

export default router;
