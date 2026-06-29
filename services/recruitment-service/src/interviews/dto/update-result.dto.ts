import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

/**
 * Kết quả phỏng vấn
 */
export enum InterviewResult {
  PASS = 'pass',
  FAIL = 'fail',
  PENDING = 'pending',
}

/**
 * DTO ghi nhận kết quả phỏng vấn
 */
export class UpdateResultDto {
  @IsEnum(InterviewResult, {
    message: 'Kết quả phải là "pass", "fail" hoặc "pending"',
  })
  result: InterviewResult;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm đánh giá phải là số' })
  @Min(0, { message: 'Điểm đánh giá phải >= 0' })
  @Max(10, { message: 'Điểm đánh giá phải <= 10' })
  overallScore?: number;
}
