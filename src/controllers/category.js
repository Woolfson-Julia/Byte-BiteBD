import createHttpError from 'http-errors';

import { getAllCategories } from '../services/category.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    if (!categories || categories.length === 0) {
      return next(createHttpError(404, 'No categories found'));
    }
    return res.status(200).json({
      status: 200,
      message: 'Successfully found categories!',
      data: categories,
    });
  } catch (error) {
    return next(
      createHttpError(500, `Internal server error: ${error.message}`),
    );
  }
};
