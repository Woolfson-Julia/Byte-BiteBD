import { recipesCollection } from '../models/recipeSchema.js';

export const getAllRecipes = async () => {
  const recipes = await recipesCollection.find();
  return recipes;
};

export const getRecipeById = async (contactId) => {
  const recipe = await recipesCollection.findById(contactId);
  return recipe;
};
