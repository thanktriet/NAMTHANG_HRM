import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString({ message: 'Mã chức vụ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã chức vụ không được để trống' })
  @MaxLength(20, { message: 'Mã chức vụ không được vượt quá 20 ký tự' })
  code: string;

  @IsString({ message: 'Tên chức vụ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên chức vụ không được để trống' })
  @MaxLength(100, { message: 'Tên chức vụ không được vượt quá 100 ký tự' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
  description?: string;

  @IsInt({ message: 'Cấp bậc phải là số nguyên' })
  @Min(1, { message: 'Cấp bậc tối thiểu là 1' })
  @IsOptional()
  level?: number;
}
