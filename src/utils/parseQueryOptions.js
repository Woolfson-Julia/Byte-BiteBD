// utils/parseQueryOptions.js
import { parsePaginationParams } from './parsePaginationParams.js';
import { parseRecipeFilterParams } from './parseRecipeFilterParams.js';
import { parseSortParams } from './parseSortParams.js';

export const parseQueryOptions = (query) => {
  const { page, perPage, skip } = parsePaginationParams(query);
  const { sortBy, sortOrder } = parseSortParams(query);
  const filter = parseRecipeFilterParams(query);

  return {
    page,
    perPage,
    skip,
    sortBy,
    sortOrder,
    filter,
  };
};
