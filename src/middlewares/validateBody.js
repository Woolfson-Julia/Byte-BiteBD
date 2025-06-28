import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {

    if (req.body.ingredients && typeof req.body.ingredients === 'string') {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    }
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errors = error.details.map(detail => detail.message);
    next(createHttpError(400, errors));
  }
};
