import createHttpError from 'http-errors';
import { Ingredient } from '../models/ingredientSchema.js';

export const getAllIngredients = async () => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    return ingredients;
  } catch (error) {
    throw createHttpError(
      500,
      `Failed to fetch ingredients - ${error.message}`,
    );
  }
};
export const getIngredientById = async (id) => {
  try {
    const ingredient = await Ingredient.findById(id);
    return ingredient;
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
    return ingredients;
  } catch (error) {
    throw createHttpError(
      500,
      `Failed to fetch ingredients - ${error.message}`,
    );
  }
};
export const getEnrichedRecipes = async (recipes) => {
  const allIngredientIds = new Set(); //lдозволяє уникнути дублікатів
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      if (ing.id) {
        allIngredientIds.add(ing.id);
      }
    });
  });

  const ingIds = [...allIngredientIds];

  const ingredientDocs = await getIngredientsById(ingIds);

  const ingredientMap = new Map();
  ingredientDocs.forEach((ing) => {
    ingredientMap.set(ing._id.toString(), ing);
  });

  const enrichedRecipes = recipes.map((recipe) => {
    const enrichedIngredients = recipe.ingredients.map(({ id, measure }) => {
      const fullIngredient = ingredientMap.get(id.toString());

      return {
        ingredient: fullIngredient || { _id: id, name: 'Not found any' },
        measure,
      };
    });

    return {
      ...(typeof recipe.toObject === 'function' ? recipe.toObject() : recipe),
      ingredients: enrichedIngredients,
    };
  });

  return enrichedRecipes;
};
export const getEnrichedRecipe = async (recipe) => {
  const [enriched] = await getEnrichedRecipes([recipe]);
  return enriched;
};
