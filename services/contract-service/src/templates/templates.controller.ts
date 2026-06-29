import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('contract-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // Lấy danh sách mẫu hợp đồng
  @Get()
  async findAll() {
    return this.templatesService.findAll();
  }

  // Lấy chi tiết mẫu hợp đồng
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  // Tạo mẫu hợp đồng mới
  @Post()
  async create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  // Cập nhật mẫu hợp đồng
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    return this.templatesService.update(id, dto);
  }

  // Xóa mẫu hợp đồng
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
