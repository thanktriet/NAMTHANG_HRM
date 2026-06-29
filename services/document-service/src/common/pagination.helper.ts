/**
 * Helper phân trang kết quả truy vấn
 */

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Tạo kết quả phân trang chuẩn
 * @param data - Mảng dữ liệu của trang hiện tại
 * @param total - Tổng số bản ghi
 * @param page - Trang hiện tại
 * @param limit - Số lượng mỗi trang
 */
export function paginateResult<T>(
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
    },
  };
}
