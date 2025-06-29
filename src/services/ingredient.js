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
export const getIngredientsById = async (ids) => {
  try {
    const ingredients = await Ingredient.find({ _id: { $in: ids } });
    if (!ingredients) {
      throw createHttpError(404, 'Ingredients not found');
    }
    return ingredients;
  } catch (error) {
    throw createHttpError(500, `Failed to fetch ingredient - ${error.message}`);
  }
};
export const getEnrichedRecipes = async (recipes) => {
  // 1. Зібрати всі унікальні id інгредієнтів
  const allIngredientIds = new Set();
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      if (ing.id) {
        allIngredientIds.add(ing.id.toString());
      }
    });
  });

  // 2. Отримати повну інформацію про інгредієнти
  const ingredientDocs = await getIngredientsById([...allIngredientIds]);

  // 3. Створити Map для швидкого доступу
  const ingredientMap = new Map();
  ingredientDocs.forEach((ing) => {
    ingredientMap.set(ing._id.toString(), ing);
  });

  // 4. Замінити id на повні об'єкти
  const enrichedRecipes = recipes.map((recipe) => {
    const enrichedIngredients = recipe.ingredients.map(({ id, measure }) => {
      const fullIngredient = ingredientMap.get(id);
      return {
        ingredient: fullIngredient || { _id: id, name: 'Not found' },
        measure,
      };
    });

    return {
      ...(recipe.toObject?.() ?? recipe),
      ingredients: enrichedIngredients,
    };
  });

  return enrichedRecipes;
};
