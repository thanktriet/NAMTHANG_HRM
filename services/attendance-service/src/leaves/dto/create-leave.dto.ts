import { IsNotEmpty, IsEnum, IsString, IsUUID, IsDateString } from 'class-validator';

/**
 * Loại nghỉ phép
 */
export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
}

/**
 * DTO tạo đơn nghỉ phép
 */
export class CreateLeaveDto {
  @IsUUID('4', { message: 'Mã nhân viên không hợp lệ' })
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId: string;

  @IsEnum(LeaveType, { message: 'Loại nghỉ phải là: annual, sick, personal hoặc maternity' })
  @IsNotEmpty({ message: 'Loại nghỉ không được để trống' })
  leaveType: LeaveType;

  @IsDateString({}, { message: 'Ngày bắt đầu phải có định dạng ngày hợp lệ' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @IsDateString({}, { message: 'Ngày kết thúc phải có định dạng ngày hợp lệ' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: string;

  @IsString({ message: 'Lý do phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Lý do không được để trống' })
  reason: string;
}
