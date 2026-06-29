import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

/**
 * Controller quản lý kỳ đánh giá KPI
 */
@Controller('kpi-periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  /**
   * Danh sách tất cả kỳ đánh giá
   */
  @Get()
  async findAll() {
    return this.periodsService.findAll();
  }

  /**
   * Tạo kỳ đánh giá mới
   */
  @Post()
  async create(@Body() createPeriodDto: CreatePeriodDto) {
    return this.periodsService.create(createPeriodDto);
  }

  /**
   * Chi tiết kỳ đánh giá theo ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.periodsService.findOne(id);
  }

  /**
   * Cập nhật thông tin kỳ đánh giá
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePeriodDto: UpdatePeriodDto,
  ) {
    return this.periodsService.update(id, updatePeriodDto);
  }

  /**
   * Đóng kỳ đánh giá (chốt điểm, không cho phép chỉnh sửa)
   */
  @Patch(':id/close')
  async close(@Param('id') id: string) {
    return this.periodsService.close(id);
  }
}
