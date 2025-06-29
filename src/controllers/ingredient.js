import createHttpError from 'http-errors';
import { getAllIngredients as getAllIngredientsService } from '../services/ingredient.js';
import { getIngredientById as getIngredientByIdService } from '../services/ingredient.js';

export const getIngredients = async (req, res, next) => {
  try {
    const ingredients = await getAllIngredientsService();
    if (!ingredients || ingredients.length === 0) {
      return next(createHttpError(404, 'No ingredients found'));
    }
    return res.status(200).json({
      status: 200,
      message: 'Successfully found ingredients!',
      data: ingredients,
    });
  } catch (error) {
    return next(
      createHttpError(500, `Internal server error: ${error.message}`),
    );
  }
};
export const getIngredientById = async (req, res, next) => {
  try {
    const ingredient = await getIngredientByIdService(req.params.id);

    if (!ingredient) {
      return next(createHttpError(404, 'Ingredient not found'));
    }
    return res.status(200).json({
      status: 200,
      message: 'Successfully found ingredient!',
      data: ingredient,
    });
  } catch (error) {
    return next(
      createHttpError(500, `Internal server error: ${error.message}`),
    );
  }
};
