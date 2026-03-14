import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { generateCaptionSchema, generateHashtagsSchema } from '../types';
import * as ctrl from '../controllers/ai.controller';

const router = Router();

router.post('/generate-caption', validate(generateCaptionSchema), ctrl.generateCaption);
router.post('/hashtags', validate(generateHashtagsSchema), ctrl.generateHashtags);

export default router;
