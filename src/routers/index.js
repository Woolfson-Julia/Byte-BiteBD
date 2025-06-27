import { Router } from 'express';
import recipesRouter from './recipes.js';
import authRouter from './auth.js';

const router = Router();

router.use('/recipes', recipesRouter);
router.use('/auth', authRouter);

export default router;
