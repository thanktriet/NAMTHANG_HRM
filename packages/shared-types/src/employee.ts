/**
 * Kiểu dữ liệu liên quan đến Nhân viên
 */

/** Giới tính */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

/** Trạng thái nhân viên */
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

/** Thông tin nhân viên */
export interface Employee {
  id: string;
  /** Mã nhân viên (VD: NV-0001) */
  employeeCode: string;
  /** Họ và tên */
  fullName: string;
  /** Ngày sinh */
  dateOfBirth: string;
  /** Giới tính */
  gender: Gender;
  /** Số CCCD */
  citizenId?: string;
  /** Email công ty */
  email: string;
  /** Số điện thoại */
  phone?: string;
  /** Địa chỉ */
  address?: string;
  /** ID phòng ban */
  departmentId: string;
  /** Tên phòng ban */
  departmentName?: string;
  /** ID vị trí */
  positionId: string;
  /** Tên vị trí */
  positionName?: string;
  /** Ngày vào làm */
  joinDate: string;
  /** Trạng thái */
  status: EmployeeStatus;
  /** Ảnh đại diện */
  avatarUrl?: string;
  /** Ngày tạo */
  createdAt: string;
  /** Ngày cập nhật */
  updatedAt: string;
}

/** DTO tạo mới nhân viên */
export interface CreateEmployeeDto {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  citizenId?: string;
  email: string;
  phone?: string;
  address?: string;
  departmentId: string;
  positionId: string;
  joinDate: string;
  avatarUrl?: string;
}

/** DTO cập nhật nhân viên */
export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

/** Bộ lọc tìm kiếm nhân viên */
export interface EmployeeFilter {
  search?: string;
  departmentId?: string;
  positionId?: string;
  status?: EmployeeStatus;
  gender?: Gender;
  page?: number;
  limit?: number;
}
