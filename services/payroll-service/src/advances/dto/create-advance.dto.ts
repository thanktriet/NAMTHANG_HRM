import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO tạo yêu cầu tạm ứng lương
 */
export class CreateAdvanceDto {
  @ApiProperty({ description: 'Mã nhân viên', example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: 'Số tiền tạm ứng (VND)', example: 5000000 })
  @IsNumber()
  @Min(100_000, { message: 'Số tiền tạm ứng tối thiểu 100,000 VND' })
  amount: number;

  @ApiPropertyOptional({ description: 'Lý do tạm ứng', example: 'Chi phí gia đình' })
  @IsOptional()
  @IsString()
  reason?: string;
}
