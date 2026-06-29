import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO tạo mẫu KPI mới
 */
export class CreateTemplateDto {
  @IsString({ message: 'Mã vị trí phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã vị trí không được để trống' })
  positionId: string;

  @IsString({ message: 'Tên tiêu chí phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên tiêu chí không được để trống' })
  criteriaName: string;

  @IsNumber({}, { message: 'Trọng số phải là số' })
  @Min(0, { message: 'Trọng số phải lớn hơn hoặc bằng 0' })
  @Max(100, { message: 'Trọng số không được vượt quá 100' })
  weight: number;

  @IsString({ message: 'Mô tả mục tiêu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mô tả mục tiêu không được để trống' })
  targetDescription: string;

  @IsString({ message: 'Phương pháp đo lường phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Phương pháp đo lường không được để trống' })
  measurementMethod: string;
}
