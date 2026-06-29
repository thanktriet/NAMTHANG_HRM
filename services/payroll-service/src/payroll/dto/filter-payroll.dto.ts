import { IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** Trạng thái kỳ lương */
export enum PayrollPeriodStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
}

/**
 * DTO lọc danh sách kỳ lương
 */
export class FilterPayrollDto {
  @ApiPropertyOptional({ description: 'Tháng', example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({ description: 'Năm', example: 2026 })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: 'Trạng thái kỳ lương', enum: PayrollPeriodStatus })
  @IsOptional()
  @IsEnum(PayrollPeriodStatus)
  status?: PayrollPeriodStatus;

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
