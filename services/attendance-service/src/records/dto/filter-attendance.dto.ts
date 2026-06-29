import { IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO lọc dữ liệu chấm công
 */
export class FilterAttendanceDto {
  @Type(() => Number)
  @IsInt({ message: 'Tháng phải là số nguyên' })
  @Min(1, { message: 'Tháng phải từ 1 đến 12' })
  @Max(12, { message: 'Tháng phải từ 1 đến 12' })
  @IsOptional()
  month?: number;

  @Type(() => Number)
  @IsInt({ message: 'Năm phải là số nguyên' })
  @Min(2020, { message: 'Năm phải từ 2020 trở đi' })
  @IsOptional()
  year?: number;

  @IsUUID('4', { message: 'Mã phòng ban không hợp lệ' })
  @IsOptional()
  departmentId?: string;

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
