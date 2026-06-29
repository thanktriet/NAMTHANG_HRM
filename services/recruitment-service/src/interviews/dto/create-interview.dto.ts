import { IsString, IsOptional, IsDateString, IsArray, IsEnum } from 'class-validator';

/**
 * Loại phỏng vấn
 */
export enum InterviewType {
  PHONE = 'phone',
  IN_PERSON = 'in_person',
  ONLINE = 'online',
  TECHNICAL = 'technical',
  HR = 'hr',
  FINAL = 'final',
}

/**
 * DTO lên lịch phỏng vấn
 */
export class CreateInterviewDto {
  @IsString({ message: 'ID ứng viên không được để trống' })
  candidateId: string;

  @IsDateString({}, { message: 'Thời gian phỏng vấn không hợp lệ' })
  scheduledAt: string;

  @IsOptional()
  @IsString({ message: 'Địa điểm không hợp lệ' })
  location?: string;

  @IsOptional()
  @IsEnum(InterviewType, { message: 'Loại phỏng vấn không hợp lệ' })
  interviewType?: InterviewType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interviewerIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interviewerNames?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
