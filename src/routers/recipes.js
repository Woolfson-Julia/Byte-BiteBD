import express from 'express';
import { getRecipes, getRecipeById, createRecipe } from '../controllers/recipe.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';


const router = express.Router();
const jsonParser = express.json();



router.get('/', ctrlWrapper(getRecipes));
router.get("/:id", ctrlWrapper (getRecipeById));
router.post('/', authenticate, jsonParser, ctrlWrapper(createRecipe));
export default router;
