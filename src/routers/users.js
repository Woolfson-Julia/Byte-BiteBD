import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getUserCurrentController } from '../controllers/user.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/current', authenticate, ctrlWrapper(getUserCurrentController));

export default router;
