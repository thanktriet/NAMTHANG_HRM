import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { CreateViolationDto } from './dto/create-violation.dto';

@Controller('violations')
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  /** Danh sách vi phạm */
  @Get()
  findAll(@Query() query: any) {
    return this.violationsService.findAll(query);
  }

  /** Thống kê vi phạm */
  @Get('stats')
  getStats() {
    return this.violationsService.getStats();
  }

  /** Lịch sử vi phạm của lái xe */
  @Get('driver/:driverId')
  findByDriver(@Param('driverId') driverId: string) {
    return this.violationsService.findByDriver(driverId);
  }

  /** Chi tiết vi phạm */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.violationsService.findOne(id);
  }

  /** Tạo mới vi phạm */
  @Post()
  create(@Body() dto: CreateViolationDto) {
    return this.violationsService.create(dto);
  }

  /** Cập nhật vi phạm */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateViolationDto>) {
    return this.violationsService.update(id, dto);
  }

  /** Xóa vi phạm */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.violationsService.remove(id);
  }
}
