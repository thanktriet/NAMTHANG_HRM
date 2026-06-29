import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

/**
 * DTO tạo kỳ đánh giá KPI mới
 */
export class CreatePeriodDto {
  @IsString({ message: 'Tên kỳ đánh giá phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên kỳ đánh giá không được để trống' })
  name: string;

  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ (định dạng ISO 8601)' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ (định dạng ISO 8601)' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: string;
}
