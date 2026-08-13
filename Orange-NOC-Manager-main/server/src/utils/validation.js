export function normalizePagination(value) {
  return {
    ...value,
    page: Number(value.page),
    limit: Number(value.limit)
  };
}
