/**
 * Interface kết quả phân trang
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Helper tạo kết quả phân trang
 * @param data - Mảng dữ liệu
 * @param total - Tổng số bản ghi
 * @param page - Trang hiện tại
 * @param limit - Số bản ghi mỗi trang
 */
export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Tính skip cho Prisma pagination
 */
export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
