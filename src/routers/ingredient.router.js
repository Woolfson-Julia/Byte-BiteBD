import { Router } from 'express';
import express from 'express';
import { getIngredients } from '../controllers/ingredient.controller.js';

const router = Router();
const jsonParser = express.json();

router.get('/', jsonParser, getIngredients);

export default router;
