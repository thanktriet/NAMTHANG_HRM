import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString({ message: 'Mã tổ chức phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã tổ chức không được để trống' })
  @MaxLength(20, { message: 'Mã tổ chức không được vượt quá 20 ký tự' })
  code: string;

  @IsString({ message: 'Tên tổ chức phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên tổ chức không được để trống' })
  @MaxLength(200, { message: 'Tên tổ chức không được vượt quá 200 ký tự' })
  name: string;

  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(500, { message: 'Địa chỉ không được vượt quá 500 ký tự' })
  address?: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(15, { message: 'Số điện thoại không được vượt quá 15 ký tự' })
  phone?: string;

  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự' })
  email?: string;

  @IsString({ message: 'Loại tổ chức phải là chuỗi ký tự' })
  @IsOptional()
  type?: string;

  @IsString({ message: 'Mã tổ chức cha không hợp lệ' })
  @IsOptional()
  parentId?: string;
}
