/**
 * Helper phân trang cho các truy vấn danh sách
 */
export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function buildPaginationOptions(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function buildPaginationResult<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 20,
): PaginationResult<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
