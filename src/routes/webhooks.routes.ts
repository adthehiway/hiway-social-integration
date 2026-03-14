import { Router } from 'express';
import { handleAyrshareWebhook } from '../controllers/webhooks.controller';

const router = Router();

router.post('/ayrshare', handleAyrshareWebhook);

export default router;
