import { Router } from 'express';
import express from 'express';
import { getCategories } from '../controllers/category.js';

const router = Router();
const jsonParser = express.json();

router.get('/', jsonParser, getCategories);

export default router;
