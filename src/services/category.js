import createHttpError from 'http-errors';

import { CategoriesCollection } from '../models/categorySchema.js';

export const getAllCategories = async () => {
  try {
    const categories = await CategoriesCollection.find();
    return categories;
  } catch (error) {
    throw createHttpError(500, `Failed to fetch categories - ${error.message}`);
  }
};
