import { Recipe } from '../models/recipeSchema.js';
import { UsersCollection } from '../models/userSchema.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseRecipeFilterParams } from '../utils/parseRecipeFilterParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { getPhotoUrl } from '../utils/getPhotoUrl.js';

import { isRecipeFavorite } from '../utils/isRecipeFavorite.js';
import mongoose from 'mongoose';

import { getEnrichedRecipes, getEnrichedRecipe } from '../services/ingredient.js';


// /api/recipes пошук рецептів за іменем/інгрідієнтами чи категоріями
// http://localhost:3000/api/recipes?ingredient=640c2dd963a319ea671e36f9
export const getRecipes = async (req, res) => {

  const { page, perPage, skip } = parsePaginationParams(req.query);
  const filter = parseRecipeFilterParams(req.query);

  const recipes = await Recipe.find(filter).skip(skip).limit(perPage);
  const total = await Recipe.countDocuments(filter);


   if (!recipes || recipes.length === 0) {
      throw createHttpError(404, 'There are no recipes matching your search!');
    }
  // передаємо в getEnrichedRecipes масив рецептів для збагачення їх інгредієнтами
  const enrichedRecipes = await getEnrichedRecipes(recipes);


    // Якщо користувач є, перевіряємо для кожного рецепта, чи є він у фейворітс
    if (req.user) {
      // Масив з промісів для перевірки фейворітів кожного рецепта
      const favoritesChecks = enrichedRecipes.map(async (recipe) => {
        const isFavorite = await isRecipeFavorite(req.user._id, recipe._id);
        return {
          ...recipe,
          isFavorite,
        };
      });

      // Чекаємо, поки всі проміси завершаться
      const enrichedWithFavorites = await Promise.all(favoritesChecks);

      return res.json({
        status: 200,
        message: 'Successfully found recipes!',
        data: {
          data: enrichedWithFavorites,
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
          data: enrichedRecipes,
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

// /api/recipes/:id пошук для отримання детальної інформації про рецепт за його id
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


// перевірка, чи є цей рецепт у фейворітс
let isFavorite = false;
if (req.user) {
  try {
    isFavorite = await isRecipeFavorite(req.user._id, id);
  } catch (err) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}
  // передаємо в getEnrichedRecipe 1 рецепт
  const enrichedRecipe = await getEnrichedRecipe(recipe);
  //повертає збагачений рецепт
  // res.status(200).json(recipe);

  res.status(200).json({
    status: 200,
    message: 'Recipe found successfully',
    data: { ...enrichedRecipe, isFavorite }
  });
};

// /add-recipe приватний ендпоінт для створення власного рецепту
// http://localhost:3000/api/recipes/add-recipe

export const createRecipe = async (req, res, next) => {
  const ownerId = req.user._id;
  const photoUrl = req.file ? await getPhotoUrl(req.file) : null;

  const newRecipeData = {
    ...req.body,
    owner: ownerId,
    recipeImg: photoUrl,
    cookiesTime: Number(req.body.cookiesTime),
    ingredientAmount: Number(req.body.ingredientAmount),
    cals: req.body.cals ? Number(req.body.cals) : undefined,
  };

  const newRecipe = await Recipe.create(newRecipeData);


  res.status(201).json({
    status: 201,
    message: 'Successfully created a new recipe!',
    data: newRecipe,
  });
};

// /profile/own пошук рецептів , які я постила

// http://localhost:3000/api/recipes/profile/own?page=2&limit=5
export const getMyRecipes = async (req, res, next) => {
  const ownerId = req.user._id;

  const { page, perPage, skip } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseRecipeFilterParams(req.query);

  filter.owner = ownerId;


    const totalItems = await Recipe.countDocuments(filter);
    if (totalItems === 0) {
      throw createHttpError(404, 'There are no recipes yet!');
    }

    const totalPages = Math.ceil(totalItems / perPage);

    const recipes = await Recipe.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(perPage);

  // Для кожного рецепту викликаємо isRecipeFavorite
    // Щоб зробити це ефективніше, можна виконати паралельно через Promise.all

    const recipesWithFavorite = await Promise.all(
      recipes.map(async (recipe) => {
        const isFavorite = await isRecipeFavorite(ownerId, recipe._id);
        return { ...recipe.toObject(), isFavorite };
      })
    );

  // передаємо в getEnrichedRecipes масив рецептів для збагачення їх інгредієнтами
  const enrichedRecipes = await getEnrichedRecipes(recipesWithFavorite);

    res.status(200).json({
      status: 200,
      message: 'Successfully found recipes!',
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
  };


// /profile/favorites створити приватний ендпоінт для додавання рецепту до списку улюблених
// http://localhost:3000/api/recipes/profile/favorites

export const addToFavorites = async (req, res, next) => {
  const userId = req.user._id;
  const { recipeId } = req.body;
  if (!recipeId) {
    throw createHttpError(400, 'Recipe ID is required');
  }

  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // Перевірка, чи рецепт існує
  const recipeExists = await Recipe.findById(recipeId);
  if (!recipeExists) {
    throw createHttpError(404, 'Recipe not found');
  }

  // Перевірка, чи рецепт уже у фаворитах
  const alreadyInFavorites = user.favorites.some(
    (id) => id.toString() === recipeId,
  );

  if (!alreadyInFavorites) {
    user.favorites.push(recipeId);
    await user.save();
  }

  // Пагінація
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * perPage;

  // Наповнюємо фаворити з пагінацією
  const populatedUser = await UsersCollection.findById(userId).populate({
    path: 'favorites',
    options: { skip, limit: perPage, sort: { createdAt: -1 } },
  });

  const totalItems = user.favorites.length;
  const totalPages = Math.ceil(totalItems / perPage);



  // передаємо в getEnrichedRecipes масив рецептів для збагачення їх інгредієнтами
  const enrichedRecipes = await getEnrichedRecipes(populatedUser.favorites);



  res.status(200).json({
    status: 200,
    message: alreadyInFavorites
      ? 'Recipe already in favorites'
      : 'Recipe added to favorites',
    data: {
      favorites: enrichedRecipes,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};

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
    throw createHttpError(404, 'Recipe is not in favorites');
  }

  user.favorites = user.favorites.filter(
    (favId) => favId.toString() !== recipeId,
  );

  await user.save();



  // Завантажити повні об'єкти рецептів, що залишилися у списку favorites
  const enrichedFavorites = await Recipe.find({
    _id: { $in: user.favorites },
  });



    // передаємо в getEnrichedRecipes масив рецептів для збагачення їх інгредієнтами
  const enrichedRecipes = await getEnrichedRecipes(enrichedFavorites);





  res.status(200).json({
    status: 200,
    message: 'Recipe removed from favorites successfully',
    data: {
      favorites: enrichedRecipes, // повертаємо повні об'єкти рецептів
    },
  });
};

// отримання улюблених рецептів
// http://localhost:3000/api/recipes/profile/favorites?page=1

export const getFavorites = async (req, res, next) => {
  const userId = req.user._id;
  const { page, perPage, skip } = parsePaginationParams(req.query);
  const filter = parseRecipeFilterParams(req.query);

  const user = await UsersCollection.findById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // Фільтруємо тільки рецепти, які є у favorites користувача
  filter._id = { $in: user.favorites };

  const totalItems = await Recipe.countDocuments(filter);
  if (totalItems === 0) {
    throw createHttpError(
      404,
      'No favorite recipes found matching your criteria',
    );
  }

  const totalPages = Math.ceil(totalItems / perPage);

  const favorites = await Recipe.find(filter)
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: -1 });



      // передаємо в getEnrichedRecipes масив рецептів для збагачення їх інгредієнтами
  const enrichedRecipes = await getEnrichedRecipes(favorites);




  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved favorite recipes',
    data: {
      enrichedRecipes,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};
