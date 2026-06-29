import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Trạng thái đơn nghỉ phép
 */
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * DTO lọc danh sách đơn nghỉ phép
 */
export class FilterLeaveDto {
  @IsEnum(LeaveStatus, { message: 'Trạng thái phải là: pending, approved hoặc rejected' })
  @IsOptional()
  status?: LeaveStatus;

  @IsOptional()
  leaveType?: string;

  @IsUUID('4', { message: 'Mã nhân viên không hợp lệ' })
  @IsOptional()
  employeeId?: string;

  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'Số lượng mỗi trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng mỗi trang phải lớn hơn 0' })
  @Max(100, { message: 'Số lượng mỗi trang tối đa 100' })
  @IsOptional()
  limit?: number = 20;
}
