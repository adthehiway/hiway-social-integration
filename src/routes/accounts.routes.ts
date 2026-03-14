import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { connectAccountSchema } from '../types';
import * as ctrl from '../controllers/accounts.controller';

const router = Router();

router.post('/connect', validate(connectAccountSchema), ctrl.connectAccount);
router.get('/', ctrl.listAccounts);
router.delete('/:platform', ctrl.disconnectAccount);

export default router;
