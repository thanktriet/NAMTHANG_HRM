import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecordsService } from './records.service';
import { CheckInDto } from './dto/check-in.dto';
import { FilterAttendanceDto } from './dto/filter-attendance.dto';

/**
 * Controller quản lý chấm công
 */
@Controller('attendance')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /**
   * Chấm công vào
   */
  @Post('check-in')
  async checkIn(@Body() dto: CheckInDto) {
    return this.recordsService.checkIn(dto);
  }

  /**
   * Chấm công ra
   */
  @Post('check-out')
  async checkOut(@Body() dto: CheckInDto) {
    return this.recordsService.checkOut(dto);
  }

  /**
   * Bảng chấm công theo tháng
   */
  @Get()
  async getMonthlyAttendance(@Query() filter: FilterAttendanceDto) {
    return this.recordsService.getMonthlyAttendance(filter);
  }

  /**
   * Lấy log chấm công hôm nay
   */
  @Get('today')
  async getTodayLog(@Query() filter: FilterAttendanceDto) {
    return this.recordsService.getTodayLog(filter);
  }

  /**
   * Tổng hợp chấm công nhân viên theo tháng
   */
  @Get('employee/:id')
  async getEmployeeSummary(
    @Param('id') employeeId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.recordsService.getEmployeeMonthlySummary(employeeId, month, year);
  }

  /**
   * Thống kê chấm công (đi trễ, về sớm, vắng, OT)
   */
  @Get('stats')
  async getStats(@Query() filter: FilterAttendanceDto) {
    return this.recordsService.getStats(filter);
  }

  // === NATS Message Handlers ===

  @MessagePattern('attendance.check-in')
  async handleCheckIn(@Payload() dto: CheckInDto) {
    return this.recordsService.checkIn(dto);
  }

  @MessagePattern('attendance.check-out')
  async handleCheckOut(@Payload() dto: CheckInDto) {
    return this.recordsService.checkOut(dto);
  }

  @MessagePattern('attendance.monthly')
  async handleMonthlyAttendance(@Payload() filter: FilterAttendanceDto) {
    return this.recordsService.getMonthlyAttendance(filter);
  }
}
