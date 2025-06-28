export const parseIngredientsMiddleware = (req, res, next) => {
  try {
    if (req.body.ingredients && typeof req.body.ingredients === 'string') {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    }
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid format for ingredients' });
  }
};
