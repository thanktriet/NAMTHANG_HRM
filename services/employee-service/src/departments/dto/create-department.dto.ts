import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'Mã phòng ban phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã phòng ban không được để trống' })
  @MaxLength(20, { message: 'Mã phòng ban không được vượt quá 20 ký tự' })
  code: string;

  @IsString({ message: 'Tên phòng ban phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên phòng ban không được để trống' })
  @MaxLength(100, { message: 'Tên phòng ban không được vượt quá 100 ký tự' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
  description?: string;

  @IsString({ message: 'Mã phòng ban cha không hợp lệ' })
  @IsOptional()
  parentId?: string;

  @IsString({ message: 'Mã người quản lý không hợp lệ' })
  @IsOptional()
  managerId?: string;
}
