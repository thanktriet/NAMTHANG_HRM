/**
 * Kiểu dữ liệu liên quan đến Xác thực & Phân quyền
 */

/** Vai trò người dùng */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  HR_STAFF = 'HR_STAFF',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

/** DTO đăng nhập */
export interface LoginDto {
  /** Email hoặc tên đăng nhập */
  email: string;
  /** Mật khẩu */
  password: string;
}

/** DTO đăng ký (nếu cần) */
export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

/** Payload lưu trong JWT token */
export interface TokenPayload {
  /** ID người dùng */
  sub: string;
  /** Email */
  email: string;
  /** Vai trò */
  role: UserRole;
  /** ID nhân viên liên kết (nếu có) */
  employeeId?: string;
  /** ID tổ chức */
  organizationId?: string;
  /** Thời gian phát hành */
  iat: number;
  /** Thời gian hết hạn */
  exp: number;
}

/** Thông tin user đã xác thực */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  employeeId?: string;
  organizationId?: string;
  /** Danh sách quyền */
  permissions: string[];
  /** Avatar URL */
  avatarUrl?: string;
}

/** Response đăng nhập thành công */
export interface LoginResponse {
  /** Access token (JWT) */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Thời gian hết hạn access token (seconds) */
  expiresIn: number;
  /** Thông tin user */
  user: AuthUser;
}

/** DTO đổi mật khẩu */
export interface ChangePasswordDto {
  /** Mật khẩu hiện tại */
  currentPassword: string;
  /** Mật khẩu mới */
  newPassword: string;
  /** Xác nhận mật khẩu mới */
  confirmPassword: string;
}
