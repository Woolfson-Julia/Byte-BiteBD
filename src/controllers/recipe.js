import { Recipe } from '../models/recipeSchema.js';
import { UsersCollection } from '../models/userSchema.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseRecipeFilterParams } from '../utils/parseRecipeFilterParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { getPhotoUrl } from '../utils/getPhotoUrl.js';
// /api/recipes пошук рецептів за іменем/інгрідієнтами чи категоріями
// http://localhost:3000/api/recipes?ingredient=640c2dd963a319ea671e36f9

export const getRecipes = async (req, res) => {
    const { page, perPage, skip } = parsePaginationParams(req.query);
    const filter = parseRecipeFilterParams(req.query);

    const recipes = await Recipe.find(filter).skip(skip).limit(perPage);
    const total = await Recipe.countDocuments(filter);

    if (recipes === null) {
        throw createHttpError(404, 'Recipes not found');
    }

    if (recipes.length === 0) {
        throw createHttpError(404, 'There are no recipes matching your search!');
    }

    res.json({
        status: 200,
        message: 'Successfully found recipes!',
        data: {
            data: recipes,
            page,
            perPage,
            totalItems: total,
            totalPages: Math.ceil(total / perPage),
            hasPreviousPage: page > 1,
            hasNextPage: page < Math.ceil(total / perPage),
        }
    });
};
// /api/recipes/:id пошук для отримання детальної інформації про рецепт за його id
// http://localhost:3000/api/recipes?ingredient=640c2dd963a319ea671e36f9
export const getRecipeById = async (req, res, next) => {

  const { id } = req.params;
  const recipe = await Recipe.findById(id);
  if (!recipe) {
    return next(createHttpError(404, 'Recipe not found'));
  }
  res.status(200).json(recipe);
};

// /add-recipe приватний ендпоінт для створення власного рецепту
// http://localhost:3000/api/recipes/add-recipe

// {
//   "name": "Bіваіаe",
//   "category": "Dessert",
//   "area": "British",
//   "instruction": "Heat oven to 180C/160C fan/gas 4 and line the base and sides of a 20cm...",
//   "decr": "A classic British cake made with almond sponge cake and covered with marzipan.",
//   "thumb": "https://ftp.goit.study/img/so-yummy/preview/Battenberg%20Cake.jpg",
//   "cookiesTime": 60,
//   "ingredientAmount": "12",
//   "ingredients": [
//     { "id": "1", "name": "almond sponge", "measure": "200g" },
//     { "id": "2", "name": "marzipan", "measure": "150g" },
//     { "id": "3", "name": "butter", "measure": "100g" },

//     { "id": "5", "name": "eggs", "measure": "3" },
//     { "id": "6", "name": "flour", "measure": "150g" },
//     { "id": "7", "name": "baking powder", "measure": "1 tsp" },
//     { "id": "8", "name": "vanilla extract", "measure": "1 tsp" },
//     { "id": "9", "name": "food coloring", "measure": "as needed" },
//     { "id": "10", "name": "jam", "measure": "100g" },
//     { "id": "11", "name": "almond essence", "measure": "1 tsp" },
//     { "id": "12", "name": "powdered sugar", "measure": "for dusting" }
//   ]
// }

export const createRecipe = async (req, res, next) => {
  const ownerId = req.user._id;
  const photoUrl = req.file ? await getPhotoUrl(req.file) : null;

    // Парсимо ingredients з рядка в масив об'єктів
  let ingredients = [];
  if (req.body.ingredients) {
      try {
        ingredients = JSON.parse(req.body.ingredients);
      } catch {
        return res.status(400).json({ message: 'Invalid ingredients format' });
      }
    }

    const newRecipeData = {
      ...req.body,
      ingredients,
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

// /profile/own пошук моїх рецептів
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

    res.status(200).json({
      status: 200,
      message: 'Successfully found recipes!',
      data: {
        recipes,
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
    (id) => id.toString() === recipeId
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

  res.status(200).json({
    status: 200,
    message: alreadyInFavorites
      ? 'Recipe already in favorites'
      : 'Recipe added to favorites',
    data: {
      favorites: populatedUser.favorites,
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
    (favId) => favId.toString() === recipeId
  );

  if (!isInFavorites) {
    throw createHttpError(404, 'Recipe is not in favorites');
  }

  user.favorites = user.favorites.filter(
    (favId) => favId.toString() !== recipeId
  );

  await user.save();

  res.status(200).json({
    status: 200,
    message: 'Recipe removed from favorites successfully',
    data: {
      favorites: user.favorites,
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
    throw createHttpError(404, 'No favorite recipes found matching your criteria');
  }

  const totalPages = Math.ceil(totalItems / perPage);

  const favorites = await Recipe.find(filter)
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved favorite recipes',
    data: {
      favorites,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });

};
