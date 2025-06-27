import { Router } from 'express';
// import recipesRouter from './recipes.js';
import authRouter from './auth.js';
import ingredientsRouter from './ingredient.router.js';
import categoriesRouter from './category.router.js';

const router = Router();

// router.use('/recipe', recipesRouter);
router.use('/auth', authRouter);
router.use('/ingredients', ingredientsRouter);
router.use('/categories', categoriesRouter);

export default router;
