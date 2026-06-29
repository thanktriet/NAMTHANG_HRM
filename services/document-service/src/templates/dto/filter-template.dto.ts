import { IsEnum, IsOptional } from 'class-validator';
import { TemplateCategory } from './create-template.dto';

/**
 * DTO lọc danh sách mẫu tài liệu
 */
export class FilterTemplateDto {
  @IsEnum(TemplateCategory, {
    message: 'Danh mục phải là một trong: contract, decision, handover, commitment, other',
  })
  @IsOptional()
  category?: TemplateCategory;
}
