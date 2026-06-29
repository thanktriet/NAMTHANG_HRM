import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateDto } from './create-template.dto';

/**
 * DTO cập nhật mẫu KPI - tất cả các trường đều optional
 */
export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}
