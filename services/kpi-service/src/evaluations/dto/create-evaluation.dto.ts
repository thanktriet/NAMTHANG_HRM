import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO chi tiết điểm đánh giá cho từng tiêu chí KPI
 */
export class EvaluationDetailDto {
  @IsString({ message: 'Mã mẫu KPI phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã mẫu KPI không được để trống' })
  templateId: string;

  @IsNumber({}, { message: 'Giá trị mục tiêu phải là số' })
  @Min(0, { message: 'Giá trị mục tiêu phải lớn hơn hoặc bằng 0' })
  targetValue: number;

  @IsNumber({}, { message: 'Giá trị thực tế phải là số' })
  @Min(0, { message: 'Giá trị thực tế phải lớn hơn hoặc bằng 0' })
  actualValue: number;

  @IsNumber({}, { message: 'Điểm số phải là số' })
  @Min(0, { message: 'Điểm số phải lớn hơn hoặc bằng 0' })
  @Max(100, { message: 'Điểm số không được vượt quá 100' })
  score: number;

  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @IsOptional()
  notes?: string;
}

/**
 * DTO tạo bản đánh giá KPI mới
 */
export class CreateEvaluationDto {
  @IsString({ message: 'Mã kỳ đánh giá phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã kỳ đánh giá không được để trống' })
  periodId: string;

  @IsString({ message: 'Mã nhân viên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã nhân viên không được để trống' })
  employeeId: string;

  @IsArray({ message: 'Chi tiết đánh giá phải là một mảng' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất một tiêu chí đánh giá' })
  @ValidateNested({ each: true, message: 'Dữ liệu chi tiết đánh giá không hợp lệ' })
  @Type(() => EvaluationDetailDto)
  details: EvaluationDetailDto[];

  @IsString({ message: 'Nhận xét phải là chuỗi ký tự' })
  @IsOptional()
  comments?: string;
}
