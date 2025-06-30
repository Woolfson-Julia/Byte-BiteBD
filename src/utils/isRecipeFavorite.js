import { UsersCollection } from '../models/userSchema.js';

export const isRecipeFavorite = async (userId, recipeId) => {
  if (!userId || !recipeId) return false;

  const user = await UsersCollection.findById(userId).select('favorites');
  if (!user) return false;

  return user.favorites.some(favId => favId.toString() === recipeId.toString());
};
