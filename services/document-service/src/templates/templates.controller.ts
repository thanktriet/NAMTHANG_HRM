import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FilterTemplateDto } from './dto/filter-template.dto';

/**
 * Controller quản lý mẫu tài liệu (document templates)
 */
@Controller('document-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * Lấy danh sách mẫu tài liệu, có thể lọc theo danh mục
   */
  @Get()
  findAll(@Query() filter: FilterTemplateDto) {
    return this.templatesService.findAll(filter);
  }

  /**
   * Lấy chi tiết một mẫu tài liệu theo ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  /**
   * Tạo mẫu tài liệu mới
   */
  @Post()
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  /**
   * Cập nhật mẫu tài liệu
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  /**
   * Xóa mẫu tài liệu
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
