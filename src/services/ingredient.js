import createHttpError from 'http-errors';

import { Ingredient } from '../models/ingredientSchema.js';

export const getAllIngredients = async () => {
  try {
    const ingredients = await Ingredient.find();
    console.log(ingredients);
    return ingredients;
  } catch (error) {
    throw createHttpError(
      500,
      `Failed to fetch ingredients - ${error.message}`,
    );
  }
};
