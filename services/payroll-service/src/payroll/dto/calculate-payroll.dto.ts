import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO yêu cầu tính lương cho kỳ lương
 */
export class CalculatePayrollDto {
  @ApiProperty({ description: 'Tháng tính lương', example: 6 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Năm tính lương', example: 2026 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;
}
