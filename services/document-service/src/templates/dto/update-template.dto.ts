import { PartialType } from '@nestjs/common';
import { CreateTemplateDto } from './create-template.dto';

/**
 * DTO cập nhật mẫu tài liệu - tất cả trường đều là tùy chọn
 */
export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}
