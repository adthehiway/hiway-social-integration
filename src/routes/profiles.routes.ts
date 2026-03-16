import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createProfileSchema } from '../types';
import * as ctrl from '../controllers/profiles.controller';

const router = Router();

router.post('/', validate(createProfileSchema), ctrl.createProfile);
router.post('/reset', ctrl.resetProfile);

export default router;
