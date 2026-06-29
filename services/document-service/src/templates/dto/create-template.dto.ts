import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Danh mục mẫu tài liệu
 */
export enum TemplateCategory {
  CONTRACT = 'contract',         // Hợp đồng
  DECISION = 'decision',         // Quyết định
  HANDOVER = 'handover',         // Biên bản bàn giao
  COMMITMENT = 'commitment',     // Cam kết
  OTHER = 'other',               // Khác
}

/**
 * DTO tạo mẫu tài liệu mới
 */
export class CreateTemplateDto {
  @IsString({ message: 'Tên mẫu tài liệu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên mẫu tài liệu không được để trống' })
  name!: string;

  @IsEnum(TemplateCategory, {
    message: 'Danh mục phải là một trong: contract, decision, handover, commitment, other',
  })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  category!: TemplateCategory;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Nội dung mẫu phải là chuỗi ký tự' })
  @IsOptional()
  contentTemplate?: string;

  @IsString({ message: 'Đường dẫn file phải là chuỗi ký tự' })
  @IsOptional()
  filePath?: string;
}
