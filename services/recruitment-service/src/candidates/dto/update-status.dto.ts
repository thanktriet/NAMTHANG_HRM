import { IsString, IsEnum, IsOptional } from 'class-validator';

/**
 * Trạng thái ứng viên
 */
export enum CandidateStatus {
  NEW = 'new',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  EVALUATION = 'evaluation',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

/**
 * DTO cập nhật trạng thái ứng viên
 */
export class UpdateStatusDto {
  @IsEnum(CandidateStatus, {
    message: 'Trạng thái không hợp lệ. Các giá trị hợp lệ: new, screening, interview, evaluation, offer, hired, rejected',
  })
  status: CandidateStatus;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;
}
