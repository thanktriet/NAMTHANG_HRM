import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

/** DTO tạo phân công phương tiện */
export class CreateAssignmentDto {
  /** Mã lái xe (nhân viên) */
  @IsString()
  @IsNotEmpty({ message: 'Mã lái xe không được để trống' })
  driverId: string;

  /** Mã phương tiện */
  @IsString()
  @IsNotEmpty({ message: 'Mã phương tiện không được để trống' })
  vehicleId: string;

  /** Ngày bắt đầu phân công */
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  startDate?: string;

  /** Ngày kết thúc dự kiến */
  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  endDate?: string;

  /** Ghi chú */
  @IsOptional()
  @IsString()
  notes?: string;
}
