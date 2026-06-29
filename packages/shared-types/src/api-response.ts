/**
 * Cấu trúc response chuẩn cho tất cả API
 */

/** Meta thông tin phân trang */
export interface PaginationMeta {
  /** Trang hiện tại */
  page: number;
  /** Số lượng bản ghi mỗi trang */
  limit: number;
  /** Tổng số bản ghi */
  total: number;
  /** Tổng số trang */
  totalPages: number;
}

/** Response chuẩn cho API */
export interface ApiResponse<T = unknown> {
  /** Trạng thái thành công hay thất bại */
  success: boolean;
  /** Dữ liệu trả về */
  data?: T;
  /** Thông báo cho client */
  message?: string;
  /** Meta thông tin bổ sung (phân trang, etc.) */
  meta?: PaginationMeta;
}

/** Response cho danh sách có phân trang */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/** Response lỗi */
export interface ErrorResponse {
  success: false;
  message: string;
  /** Mã lỗi nội bộ */
  errorCode?: string;
  /** Chi tiết lỗi validation */
  errors?: Record<string, string[]>;
}
