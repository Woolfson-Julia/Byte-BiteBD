import { UsersCollection } from '../models/userSchema.js';

export const getFavoritesCount = async (recipeId) => {
  const count = await UsersCollection.countDocuments({ favorites: recipeId });
  return count;
};
