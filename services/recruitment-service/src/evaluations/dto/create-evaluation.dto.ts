import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

/**
 * Khuyến nghị sau đánh giá
 */
export enum Recommendation {
  STRONG_HIRE = 'strong_hire',
  HIRE = 'hire',
  MAYBE = 'maybe',
  NO_HIRE = 'no_hire',
  STRONG_NO_HIRE = 'strong_no_hire',
}

/**
 * DTO tạo đánh giá ứng viên
 */
export class CreateEvaluationDto {
  @IsString({ message: 'ID ứng viên không được để trống' })
  candidateId: string;

  @IsString({ message: 'ID người đánh giá không được để trống' })
  evaluatorId: string;

  @IsString({ message: 'Tên người đánh giá không được để trống' })
  evaluatorName: string;

  @IsOptional()
  @IsString()
  interviewId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm kỹ thuật phải là số' })
  @Min(0, { message: 'Điểm kỹ thuật phải >= 0' })
  @Max(10, { message: 'Điểm kỹ thuật phải <= 10' })
  technicalScore?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm giao tiếp phải là số' })
  @Min(0, { message: 'Điểm giao tiếp phải >= 0' })
  @Max(10, { message: 'Điểm giao tiếp phải <= 10' })
  communicationScore?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm thái độ phải là số' })
  @Min(0, { message: 'Điểm thái độ phải >= 0' })
  @Max(10, { message: 'Điểm thái độ phải <= 10' })
  attitudeScore?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm kinh nghiệm phải là số' })
  @Min(0, { message: 'Điểm kinh nghiệm phải >= 0' })
  @Max(10, { message: 'Điểm kinh nghiệm phải <= 10' })
  experienceScore?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Điểm phù hợp văn hóa phải là số' })
  @Min(0, { message: 'Điểm phù hợp văn hóa phải >= 0' })
  @Max(10, { message: 'Điểm phù hợp văn hóa phải <= 10' })
  cultureFitScore?: number;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  weaknesses?: string;

  @IsOptional()
  @IsEnum(Recommendation, {
    message: 'Khuyến nghị không hợp lệ. Giá trị: strong_hire, hire, maybe, no_hire, strong_no_hire',
  })
  recommendation?: Recommendation;

  @IsOptional()
  @IsString()
  notes?: string;
}
