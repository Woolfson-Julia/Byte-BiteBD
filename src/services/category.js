import createHttpError from 'http-errors';

import { Category } from '../models/categorySchema.js';

export const getAllCategories = async () => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return categories;
  } catch (error) {
    throw createHttpError(500, `Failed to fetch categories - ${error.message}`);
  }
};
export const getCategoryById = async (id) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw createHttpError(404, 'Category not found');
    }
    return category;
  } catch (error) {
    throw createHttpError(500, `Failed to fetch category - ${error.message}`);
  }
};
export const getCategoryByName = async (name) => {
  try {
    const category = await Category.findOne({ name });
    if (!category) {
      throw createHttpError(404, 'Category not found');
    }
    return category;
  } catch (error) {
    throw createHttpError(500, `Failed to fetch category - ${error.message}`);
  }
};
