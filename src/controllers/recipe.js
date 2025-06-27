import { Recipe } from '../models/recipeSchema.js';

// /api/recipes пошук рецептів за іменем/інгрідієнтами чи категоріями
export const getRecipes = async (req, res) => {

    const { category, ingredient, name, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category) {
        filter.category = category;
    }

    if (ingredient) {
        filter['ingredients.id'] = ingredient;
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const recipes = await Recipe.find(filter).skip(skip).limit(Number(limit));
    const total = await Recipe.countDocuments(filter);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      recipes,
    });
};

// /api/recipes/:id пошук для отримання детальної інформації про рецепт за його id
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in getRecipeById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// /api/recipes приватний ендпоінт для створення власного рецепту
export const createRecipe = async (req, res, next) => {
  try {

    const ownerId = req.user._id;

    const data = { ...req.body, owner: ownerId };

    const newRecipe = await Recipe.create(data);

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: newRecipe,
    });
  } catch (error) {
    next(error);
  }
};
