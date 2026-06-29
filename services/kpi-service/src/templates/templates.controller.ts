import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

/**
 * Controller quản lý mẫu KPI theo vị trí
 */
@Controller('kpi-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * Tạo mẫu KPI mới
   */
  @Post()
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  /**
   * Danh sách mẫu KPI - lọc theo vị trí (positionId)
   */
  @Get()
  async findAll(@Query('positionId') positionId?: string) {
    return this.templatesService.findAll(positionId);
  }

  /**
   * Chi tiết mẫu KPI theo ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  /**
   * Cập nhật mẫu KPI
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  /**
   * Xóa mẫu KPI
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
