import { Router } from 'express';
import express from 'express';
import { getIngredients } from '../controllers/ingredient.js';

const router = Router();
const jsonParser = express.json();

router.get('/', jsonParser, getIngredients);
router.get('/:id', jsonParser, getIngredients);
export default router;
