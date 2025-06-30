import { RECIPE_SORT_KEYS, SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  if (!sortOrder) return SORT_ORDER.ASC;
  return [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder) ? sortOrder : SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  if (!sortBy) return 'title';
  return RECIPE_SORT_KEYS.includes(sortBy) ? sortBy : 'title';
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;
  return {
    sortOrder: parseSortOrder(sortOrder),
    sortBy: parseSortBy(sortBy),
  };
};
