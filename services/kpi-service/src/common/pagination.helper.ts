/**
 * Interface mô tả thông tin phân trang
 */
export interface PaginationMeta {
  /** Trang hiện tại */
  page: number;
  /** Số bản ghi mỗi trang */
  limit: number;
  /** Tổng số bản ghi */
  totalItems: number;
  /** Tổng số trang */
  totalPages: number;
  /** Có trang trước không */
  hasPreviousPage: boolean;
  /** Có trang tiếp theo không */
  hasNextPage: boolean;
}

/**
 * Interface kết quả phân trang
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Tham số phân trang đầu vào
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Helper hỗ trợ phân trang cho các truy vấn Prisma
 */
export class PaginationHelper {
  /** Số trang mặc định */
  private static readonly DEFAULT_PAGE = 1;
  /** Số bản ghi mỗi trang mặc định */
  private static readonly DEFAULT_LIMIT = 10;
  /** Số bản ghi tối đa mỗi trang */
  private static readonly MAX_LIMIT = 100;

  /**
   * Tính toán skip và take cho Prisma query
   * @param params - Tham số phân trang từ client
   * @returns Object chứa skip, take và thông tin trang
   */
  static getPaginationParams(params: PaginationParams): {
    skip: number;
    take: number;
    page: number;
    limit: number;
  } {
    const page = Math.max(params.page || this.DEFAULT_PAGE, 1);
    const limit = Math.min(
      Math.max(params.limit || this.DEFAULT_LIMIT, 1),
      this.MAX_LIMIT,
    );

    return {
      skip: (page - 1) * limit,
      take: limit,
      page,
      limit,
    };
  }

  /**
   * Tạo kết quả phân trang từ dữ liệu và tổng số bản ghi
   * @param data - Mảng dữ liệu của trang hiện tại
   * @param totalItems - Tổng số bản ghi trong database
   * @param page - Trang hiện tại
   * @param limit - Số bản ghi mỗi trang
   * @returns Kết quả phân trang đầy đủ
   */
  static createPaginatedResult<T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }
}
