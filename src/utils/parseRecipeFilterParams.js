export const parseRecipeFilterParams = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.ingredient) {
    filter['ingredients.id'] = query.ingredient;
  }

  if (query.name) {
    filter.name = { $regex: query.name, $options: 'i' };
  }

  return filter;
};
