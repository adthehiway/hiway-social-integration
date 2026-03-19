import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller';

const router = Router();

// POST /social/analytics/post — Get analytics for a specific post
router.post('/post', ctrl.getPostAnalytics);

// POST /social/analytics/social — Get account-level analytics
router.post('/social', ctrl.getSocialAnalytics);

// GET /social/analytics/history — Get post history
router.get('/history', ctrl.getPostHistory);

export default router;
