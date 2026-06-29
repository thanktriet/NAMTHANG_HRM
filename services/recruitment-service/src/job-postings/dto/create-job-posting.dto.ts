import { IsString, IsOptional, IsNumber, IsDateString, Min, IsArray } from 'class-validator';

/**
 * DTO tạo/cập nhật tin tuyển dụng
 */
export class CreateJobPostingDto {
  @IsString({ message: 'Tiêu đề không được để trống' })
  title: string;

  @IsString({ message: 'Vị trí tuyển dụng không được để trống' })
  position: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Số lượng tuyển phải là số' })
  @Min(1, { message: 'Số lượng tuyển phải >= 1' })
  quantity?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsOptional()
  @IsString()
  workLocation?: string;

  @IsOptional()
  @IsString()
  workType?: string; // full-time, part-time, contract

  @IsOptional()
  @IsDateString({}, { message: 'Hạn nộp hồ sơ không hợp lệ' })
  deadline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
