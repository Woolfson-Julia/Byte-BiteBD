import { RECIPE_SORT_KEYS, SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  if (!sortOrder) return SORT_ORDER.ASC;
  const order = sortOrder.toLowerCase();
  return [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(order) ? order : SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  if (!sortBy) return 'title';
  return RECIPE_SORT_KEYS.includes(sortBy) ? sortBy : 'title';
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;
    const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

 console.log('логування для чеку:', { sortBy: parsedSortBy, sortOrder: parsedSortOrder });


  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
