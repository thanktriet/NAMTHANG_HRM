import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';

/** Danh mục tài sản */
export enum AssetCategory {
  LAPTOP = 'LAPTOP',       // Laptop
  PHONE = 'PHONE',         // Điện thoại
  CAR = 'CAR',             // Xe ô tô
  UNIFORM = 'UNIFORM',     // Đồng phục
  EQUIPMENT = 'EQUIPMENT', // Thiết bị khác
}

export class CreateAssetDto {
  @IsString({ message: 'Mã tài sản phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã tài sản không được để trống' })
  @MaxLength(50, { message: 'Mã tài sản không được vượt quá 50 ký tự' })
  code: string;

  @IsString({ message: 'Tên tài sản phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên tài sản không được để trống' })
  @MaxLength(200, { message: 'Tên tài sản không được vượt quá 200 ký tự' })
  name: string;

  @IsEnum(AssetCategory, { message: 'Danh mục phải là LAPTOP, PHONE, CAR, UNIFORM hoặc EQUIPMENT' })
  @IsNotEmpty({ message: 'Danh mục tài sản không được để trống' })
  category: AssetCategory;

  @IsString({ message: 'Thương hiệu phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(100, { message: 'Thương hiệu không được vượt quá 100 ký tự' })
  brand?: string;

  @IsString({ message: 'Model phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(100, { message: 'Model không được vượt quá 100 ký tự' })
  model?: string;

  @IsString({ message: 'Số serial phải là chuỗi ký tự' })
  @IsOptional()
  @MaxLength(100, { message: 'Số serial không được vượt quá 100 ký tự' })
  serialNumber?: string;

  @IsDateString({}, { message: 'Ngày mua không đúng định dạng' })
  @IsOptional()
  purchaseDate?: string;

  @IsNumber({}, { message: 'Giá mua phải là số' })
  @Min(0, { message: 'Giá mua không được âm' })
  @IsOptional()
  purchasePrice?: number;

  @IsString({ message: 'Mã tổ chức không hợp lệ' })
  @IsNotEmpty({ message: 'Tổ chức không được để trống' })
  organizationId: string;
}
