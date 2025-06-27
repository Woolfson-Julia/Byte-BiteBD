import { Router } from 'express';
// import recipesRouter from './recipes.js';
import authRouter from './auth.js';
import usersRouter from './users.js';

const router = Router();

// router.use('/recipe', recipesRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);

export default router;
