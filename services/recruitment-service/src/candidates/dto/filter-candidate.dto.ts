import { IsOptional, IsString, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO lọc danh sách ứng viên
 */
export class FilterCandidateDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số trang phải là số' })
  @Min(1, { message: 'Số trang phải >= 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng mỗi trang phải là số' })
  @Min(1, { message: 'Số lượng mỗi trang phải >= 1' })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
