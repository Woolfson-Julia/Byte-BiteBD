export const parseRecipeFilterParams = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.ingredient) {
    filter['ingredients.id'] = query.ingredient;
  }

  if (query.title) {
    filter.title = { $regex: query.title, $options: 'i' };
  }

  return filter;
};
