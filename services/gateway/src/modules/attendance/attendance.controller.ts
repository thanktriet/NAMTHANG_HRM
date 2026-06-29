import { Controller, Get, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('search') search?: string,
  ) {
    return this.attendanceService.findAll(month, year, search);
  }

  @Get('today')
  async getToday() {
    return this.attendanceService.getToday();
  }

  @Get('stats')
  async getStats() {
    return this.attendanceService.getStats();
  }
}
