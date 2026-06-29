import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO trả tài sản
 */
export class ReturnAssetDto {
  /** Tình trạng tài sản khi trả */
  @IsNotEmpty({ message: 'Tình trạng khi trả không được để trống' })
  @IsString({ message: 'Tình trạng khi trả phải là chuỗi ký tự' })
  conditionOnReturn: string;

  /** Ghi chú */
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;
}
