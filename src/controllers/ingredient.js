import createHttpError from 'http-errors';

import { getAllIngredients } from '../services/ingredient.js';
export const getIngredients = async (req, res, next) => {
  try {
    const ingredients = await getAllIngredients();
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
