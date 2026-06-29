import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO lọc danh sách hoa hồng
 */
export class FilterCommissionDto {
  @ApiPropertyOptional({ description: 'Tháng' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({ description: 'Năm' })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: 'Mã tài xế' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ description: 'Trạng thái', enum: ['CALCULATED', 'APPROVED', 'PAID'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số bản ghi mỗi trang', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
