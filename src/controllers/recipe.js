import { Recipe } from '../models/recipeSchema.js';
import { UsersCollection } from '../models/userSchema.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseRecipeFilterParams } from '../utils/parseRecipeFilterParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseQueryOptions } from '../utils/parseQueryOptions.js';
import { getPhotoUrl } from '../utils/getPhotoUrl.js';
import { isRecipeFavorite } from '../utils/isRecipeFavorite.js';
import mongoose from 'mongoose';
import { getEnrichedRecipes, getEnrichedRecipe } from '../services/ingredient.js';

// ================================FIND ALL RECIPES=======================================
// http://localhost:3000/api/recipes?ingredient=640c2dd963a319ea671e36f9
export const getRecipes = async (req, res) => {
  const { page, perPage, skip, sortBy, sortOrder, filter } = parseQueryOptions(req.query);

  const recipes = await Recipe.find(filter)
  .collation({ locale: 'en', strength: 2 })
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(perPage);

  const total = await Recipe.countDocuments(filter);

   if (!recipes || recipes.length === 0) {
      throw createHttpError(404, 'There are no recipes matching your search!'); }

  const enrichedRecipes = await getEnrichedRecipes(recipes);

    if (req.user) {
      const favoritesChecks = enrichedRecipes.map(async (recipe) => {
        const isFavorite = await isRecipeFavorite(req.user._id, recipe._id);
        return { ...recipe, isFavorite };
      });

    const enrichedWithFavorites = await Promise.all(favoritesChecks);

      return res.json({
        status: 200,
        message: 'Successfully found recipes!',
        data: {
          recipes: enrichedWithFavorites,
          page,
          perPage,
          totalItems: total,
          totalPages: Math.ceil(total / perPage),
          hasPreviousPage: page > 1,
          hasNextPage: page < Math.ceil(total / perPage),
        },
      });
    } else {
      // Якщо користувача немає — повертаємо без поля isFavorite
      res.json({
        status: 200,
        message: 'Successfully found recipes!',
        data: {
          recipes: enrichedRecipes,
          page,
          perPage,
          totalItems: total,
          totalPages: Math.ceil(total / perPage),
          hasPreviousPage: page > 1,
          hasNextPage: page < Math.ceil(total / perPage),
        },
      });
    }
};

// ================================FIND RECIPET BY ID=======================================
// http://localhost:3000/api/recipes?ingredient=640c2dd963a319ea671e36f9
export const getRecipeById = async (req, res, next) => {
  const { id } = req.params;
if (!mongoose.Types.ObjectId.isValid(id)) {
  return next(createHttpError(400, 'Invalid recipe ID format'));
}

  const recipe = await Recipe.findById(id);
  if (!recipe) {
    return next(createHttpError(404, 'Recipe not found'));
  }

let isFavorite = false;
if (req.user) {
  try {
    isFavorite = await isRecipeFavorite(req.user._id, id);
  } catch (err) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

  const enrichedRecipe = await getEnrichedRecipe(recipe);

  res.status(200).json({
    status: 200,
    message: 'Recipe found successfully',
    data:
    {recipes: { ...enrichedRecipe, isFavorite }}
  });
};

// ================================ADD NEW RECIPET=======================================
// http://localhost:3000/api/recipes/add-recipe

export const createRecipe = async (req, res, next) => {
  const ownerId = req.user._id;
  const photoUrl = req.file ? await getPhotoUrl(req.file) : null;

  const newRecipeData = {
    ...req.body,
    owner: ownerId,
    thumb: photoUrl,
    time: Number(req.body.time),
    ingredientAmount: Number(req.body.ingredientAmount),
    cals: req.body.cals ? Number(req.body.cals) : undefined,
  };

  const newRecipe = await Recipe.create(newRecipeData);

  const enrichedRecipe = await getEnrichedRecipe(newRecipe);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a new recipe!',
    data: {recipes: enrichedRecipe},
  });
};

// ================================GET ALL MY RECIPES=======================================
// http://localhost:3000/api/recipes/profile/own?page=2&limit=5
export const getMyRecipes = async (req, res, next) => {
  const ownerId = req.user._id;
  const { page, perPage, skip, sortBy, sortOrder, filter } = parseQueryOptions(req.query);

  filter.owner = ownerId;

  const totalItems = await Recipe.countDocuments(filter);
    if (totalItems === 0) { throw createHttpError(404, 'There are no recipes yet!'); }

  const findRecipes = await Recipe.find(filter)
    .collation({ locale: 'en', strength: 2 })
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(perPage);

  const recipesWithFavorite = await Promise.all(
    findRecipes.map(async (recipe) => {
    const isFavorite = await isRecipeFavorite(ownerId, recipe._id);
        return { ...recipe.toObject(), isFavorite };
      })
  );

  const recipes = await getEnrichedRecipes(recipesWithFavorite);

    res.status(200).json({
      status: 200,
      message: 'Successfully found recipes!',
      data: {
        recipes: recipes,
        page,
        perPage,
        totalItems,
        totalPages: Math.ceil(totalItems / perPage),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(totalItems / perPage),
      },
    });
  };


// ================================ADD RECIPET IN FAVORITES =======================================
// http://localhost:3000/api/recipes/profile/favorites
export const addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { recipeId } = req.body;

    if (!recipeId) {
      throw createHttpError(400, 'Recipe ID is required');
    }

    const user = await UsersCollection.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      throw createHttpError(404, 'Recipe not found');
    }

    const alreadyInFavorites = user.favorites.some(
      (id) => id.toString() === recipeId,
    );

    if (!alreadyInFavorites) {
      user.favorites.unshift(recipeId); // додаємо в початок
      await user.save();
    }

    const { page, perPage, skip, sortBy, sortOrder, filter } = parseQueryOptions(req.query);

    // Працюємо лише з рецептами, що в favorites
    filter._id = { $in: user.favorites };

    // Загальна кількість
    const totalItems = await Recipe.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / perPage);

    // Отримуємо всі рецепти з урахуванням фільтра, сортування, пагінації
    const recipes = await Recipe.find(filter)
      .collation({ locale: 'en', strength: 2 })
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(perPage);

    const sortedRecipes = recipes.sort((a, b) => {
      const aIndex = user.favorites.indexOf(a._id.toString());
      const bIndex = user.favorites.indexOf(b._id.toString());
      return aIndex - bIndex;
    });

    const enrichedRecipes = await getEnrichedRecipes(sortedRecipes);

    res.status(200).json({
      status: 200,
      message: alreadyInFavorites
        ? 'Recipe already in favorites'
        : 'Recipe added to favorites',
      data: {
        recipes: enrichedRecipes,
        page,
        perPage,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================================DELETE RECIPET FROM FAVORITES =======================================
//  /favorites/:recipeId' створити приватний ендпоінт для видалення рецепту зі списку улюблених
export const removeFavorite = async (req, res, next) => {
  const userId = req.user._id;
  const recipeId = req.params.recipeId;

  if (!recipeId) {
    throw createHttpError(400, 'Recipe ID is required');
  }

  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isInFavorites = user.favorites.some(
    (favId) => favId.toString() === recipeId,
  );

  if (!isInFavorites) {
    throw createHttpError(404, 'Recipe not found in user favorites');
  }

  user.favorites = user.favorites.filter(
    (favId) => favId.toString() !== recipeId,
  );

  await user.save();

  // Отримуємо параметри пагінації та фільтрації з query
  const { page, perPage, skip, sortBy, sortOrder, filter } = parseQueryOptions(req.query);


    // Фільтруємо тільки за рецептами, що лишилися в favorites
    filter._id = { $in: user.favorites };

    // Підрахунок загальної кількості з урахуванням фільтра
    const totalItems = await Recipe.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / perPage);

    // Отримуємо рецепти з урахуванням пагінації і сортування (тимчасово без унікального сортування по favorites)
    const recipes = await Recipe.find(filter)
      .collation({ locale: 'en', strength: 2 })
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(perPage);

    // Сортуємо отримані рецепти відповідно до порядку в user.favorites
    const sortedRecipes = recipes.sort((a, b) => {
      const aIndex = user.favorites.findIndex(id => id.toString() === a._id.toString());
      const bIndex = user.favorites.findIndex(id => id.toString() === b._id.toString());
      return aIndex - bIndex;
    });

    const enrichedRecipes = await getEnrichedRecipes(sortedRecipes);

    res.status(200).json({
      status: 200,
      message: 'Recipe removed from favorites successfully',
      data: {
        recipes: enrichedRecipes,
        page,
        perPage,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
}});
  };

// ================================GET ALL FAVORITES RECIPES=========================================
// http://localhost:3000/api/recipes/profile/favorites?page=1

export const getFavorites = async (req, res, next) => {
  const userId = req.user._id;
  const { page, perPage, skip, sortBy, sortOrder, filter } = parseQueryOptions(req.query);

  const user = await UsersCollection.findById(userId);
  if (!user) { throw createHttpError(404, 'User not found'); }

    const favoriteIds = user.favorites.map(id => id.toString());

    if (favoriteIds.length === 0) {
      throw createHttpError(404, 'No favorite recipes found');
    }

    // Обмежуємо пошук рецептами з favorites
    filter._id = { $in: favoriteIds };

    // Рахуємо загальну кількість
    const totalItems = await Recipe.countDocuments(filter);
    if (totalItems === 0) {
      throw createHttpError(404, 'No favorite recipes found matching your criteria');
    }

    // Вибираємо всі відповідні рецепти без пагінації для правильного сортування
    const allFavorites = await Recipe.find(filter)
      .collation({ locale: 'en', strength: 2 })
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }); // первинне сортування (наприклад, по алфавіту)

    // Сортуємо за порядком у favorites користувача
    const sortedFavorites = allFavorites.sort((a, b) => {
      const aIndex = favoriteIds.indexOf(a._id.toString());
      const bIndex = favoriteIds.indexOf(b._id.toString());
      return aIndex - bIndex;
    });

    // Після сортування застосовуємо пагінацію вручну
    const paginatedFavorites = sortedFavorites.slice(skip, skip + perPage);

    const enrichedRecipes = await getEnrichedRecipes(paginatedFavorites);

    res.status(200).json({
      status: 200,
      message: 'Successfully retrieved favorite recipes',
      data: {
        recipes: enrichedRecipes,
        page,
        perPage,
        totalItems,
        totalPages: Math.ceil(totalItems / perPage),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(totalItems / perPage),
      },
    });
};
