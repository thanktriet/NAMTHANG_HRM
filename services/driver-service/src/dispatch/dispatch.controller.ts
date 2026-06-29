import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { FilterDispatchDto } from './dto/filter-dispatch.dto';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  /** Tạo lệnh điều xe */
  @Post()
  create(@Body() dto: CreateDispatchDto) {
    return this.dispatchService.create(dto);
  }

  /** Danh sách lệnh điều xe */
  @Get()
  findAll(@Query() filter: FilterDispatchDto) {
    return this.dispatchService.findAll(filter);
  }

  /** Bảng Kanban - nhóm theo trạng thái */
  @Get('board')
  getBoard() {
    return this.dispatchService.getBoard();
  }

  /** Chi tiết lệnh điều xe */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispatchService.findOne(id);
  }

  /** Bắt đầu chuyến đi */
  @Patch(':id/start')
  start(@Param('id') id: string) {
    return this.dispatchService.start(id);
  }

  /** Hoàn thành chuyến đi */
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.dispatchService.complete(id);
  }

  /** Hủy lệnh điều xe */
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: { reason?: string }) {
    return this.dispatchService.cancel(id, dto.reason);
  }
}
