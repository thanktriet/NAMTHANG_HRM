import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** DTO lọc danh sách lệnh điều xe */
export class FilterDispatchDto {
  /** Trạng thái: pending, in_transit, completed, cancelled */
  @IsOptional()
  @IsString()
  status?: string;

  /** Mã lái xe */
  @IsOptional()
  @IsString()
  driverId?: string;

  /** Ngày bắt đầu (lọc theo khoảng thời gian) */
  @IsOptional()
  @IsString()
  fromDate?: string;

  /** Ngày kết thúc (lọc theo khoảng thời gian) */
  @IsOptional()
  @IsString()
  toDate?: string;

  /** Trang hiện tại */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /** Số bản ghi mỗi trang */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 20;
}
