import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { FilterEvaluationDto } from './dto/filter-evaluation.dto';

/**
 * Controller quản lý đánh giá KPI nhân viên
 */
@Controller('kpi-evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  /**
   * Tạo bản đánh giá KPI mới
   */
  @Post()
  async create(@Body() createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationsService.create(createEvaluationDto);
  }

  /**
   * Thống kê điểm trung bình theo phòng ban
   * Đặt trước route :id để tránh xung đột
   */
  @Get('stats')
  async getStats() {
    return this.evaluationsService.getStats();
  }

  /**
   * Danh sách đánh giá KPI có bộ lọc và phân trang
   */
  @Get()
  async findAll(@Query() filter: FilterEvaluationDto) {
    return this.evaluationsService.findAll(filter);
  }

  /**
   * Chi tiết đánh giá theo ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  /**
   * Danh sách đánh giá theo nhân viên
   */
  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.evaluationsService.findByEmployee(employeeId);
  }
}
