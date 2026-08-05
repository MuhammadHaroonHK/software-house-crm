export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function getPagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page) || 1);

  const limit = Math.min(
    100,
    Math.max(1, Number(query.limit) || 10)
  );

  const skip = (page - 1) * limit;

  const search = query.search?.trim() || "";

  const sortBy = query.sortBy || "createdAt";

  const sortOrder: "asc" | "desc" =
    query.sortOrder === "asc" ? "asc" : "desc";

  return {
    page,
    limit,
    skip,
    search,
    sortBy,
    sortOrder,
  };
}