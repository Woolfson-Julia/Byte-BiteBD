export const parsePaginationParams = (query) => {
  const page = Number(query.page) || 1;
  const perPage = Number(query.limit) || 12;
  const skip = (page - 1) * perPage;

  return { page, perPage, skip };
};
