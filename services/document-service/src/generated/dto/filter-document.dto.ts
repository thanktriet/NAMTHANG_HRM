import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Trạng thái tài liệu
 */
export enum DocumentStatus {
  DRAFT = 'draft',       // Bản nháp
  SIGNED = 'signed',     // Đã ký
  ARCHIVED = 'archived', // Đã lưu trữ
}

/**
 * DTO lọc danh sách tài liệu đã tạo
 */
export class FilterDocumentDto {
  @IsUUID('4', { message: 'ID mẫu tài liệu phải là UUID hợp lệ' })
  @IsOptional()
  templateId?: string;

  @IsUUID('4', { message: 'ID nhân viên phải là UUID hợp lệ' })
  @IsOptional()
  employeeId?: string;

  @IsEnum(DocumentStatus, {
    message: 'Trạng thái phải là một trong: draft, signed, archived',
  })
  @IsOptional()
  status?: DocumentStatus;

  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'Số lượng mỗi trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng mỗi trang phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  limit?: number = 10;
}
