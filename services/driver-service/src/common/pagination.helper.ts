/**
 * Helper phân trang - Hỗ trợ tính toán phân trang cho các query
 */

/** Interface kết quả phân trang */
export interface PaginatedResult<T> {
  /** Dữ liệu */
  data: T[];
  /** Thông tin phân trang */
  meta: {
    /** Tổng số bản ghi */
    total: number;
    /** Trang hiện tại */
    page: number;
    /** Số bản ghi mỗi trang */
    limit: number;
    /** Tổng số trang */
    totalPages: number;
    /** Có trang trước không */
    hasPreviousPage: boolean;
    /** Có trang sau không */
    hasNextPage: boolean;
  };
}

/** Tính toán thông tin phân trang */
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
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

/** Tính skip từ page và limit */
export function calculateSkip(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

/** Giá trị mặc định cho phân trang */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Chuẩn hóa tham số phân trang */
export function normalizePagination(page?: number, limit?: number) {
  const normalizedPage = Math.max(1, page || DEFAULT_PAGE);
  const normalizedLimit = Math.min(MAX_LIMIT, Math.max(1, limit || DEFAULT_LIMIT));

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: calculateSkip(normalizedPage, normalizedLimit),
  };
}
