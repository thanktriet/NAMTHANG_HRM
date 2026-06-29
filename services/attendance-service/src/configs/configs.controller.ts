import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConfigsService } from './configs.service';
import { CreateConfigDto } from './dto/create-config.dto';

/**
 * Controller quản lý cấu hình ca làm việc
 */
@Controller('attendance/configs')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  /**
   * Lấy danh sách cấu hình ca làm việc
   */
  @Get()
  async findAll() {
    return this.configsService.findAll();
  }

  /**
   * Tạo cấu hình ca làm việc mới
   */
  @Post()
  async create(@Body() dto: CreateConfigDto) {
    return this.configsService.create(dto);
  }

  /**
   * Cập nhật cấu hình ca làm việc
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateConfigDto>) {
    return this.configsService.update(id, dto);
  }

  /**
   * Xóa cấu hình ca làm việc
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.configsService.remove(id);
  }

  // === NATS Message Handlers ===

  @MessagePattern('attendance.configs.list')
  async handleFindAll() {
    return this.configsService.findAll();
  }

  @MessagePattern('attendance.configs.create')
  async handleCreate(@Payload() dto: CreateConfigDto) {
    return this.configsService.create(dto);
  }
}
