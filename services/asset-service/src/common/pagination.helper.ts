/**
 * Cấu trúc phản hồi có phân trang
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    /** Tổng số bản ghi */
    total: number;
    /** Trang hiện tại */
    page: number;
    /** Số bản ghi mỗi trang */
    limit: number;
    /** Tổng số trang */
    totalPages: number;
  };
}

/**
 * Hàm hỗ trợ tạo kết quả phân trang
 * @param data - Mảng dữ liệu của trang hiện tại
 * @param page - Số trang hiện tại
 * @param limit - Số bản ghi mỗi trang
 * @param totalCount - Tổng số bản ghi trong cơ sở dữ liệu
 * @returns Kết quả phân trang bao gồm dữ liệu và thông tin meta
 */
export function paginate<T>(
  data: T[],
  page: number,
  limit: number,
  totalCount: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages,
    },
  };
}
