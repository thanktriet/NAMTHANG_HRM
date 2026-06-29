import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO bộ lọc danh sách đánh giá KPI
 */
export class FilterEvaluationDto {
  @IsString({ message: 'Mã kỳ đánh giá phải là chuỗi ký tự' })
  @IsOptional()
  periodId?: string;

  @IsString({ message: 'Mã phòng ban phải là chuỗi ký tự' })
  @IsOptional()
  departmentId?: string;

  @IsString({ message: 'Xếp loại phải là chuỗi ký tự' })
  @IsOptional()
  grade?: string;

  @IsNumber({}, { message: 'Số trang phải là số' })
  @Min(1, { message: 'Số trang phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber({}, { message: 'Số bản ghi mỗi trang phải là số' })
  @Min(1, { message: 'Số bản ghi mỗi trang phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
