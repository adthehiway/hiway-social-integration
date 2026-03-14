import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createPostSchema, approvePostSchema, rejectPostSchema } from '../types';
import * as ctrl from '../controllers/posts.controller';

const router = Router();

router.post('/', validate(createPostSchema), ctrl.createPost);
router.get('/', ctrl.listPosts);
router.get('/pending', ctrl.listPendingPosts);
router.get('/:id', ctrl.getPost);
router.delete('/:id', ctrl.cancelPost);
router.post('/:id/approve', validate(approvePostSchema), ctrl.approvePost);
router.post('/:id/reject', validate(rejectPostSchema), ctrl.rejectPost);

export default router;
