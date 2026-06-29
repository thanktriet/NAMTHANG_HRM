import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { FilterPayrollDto } from './dto/filter-payroll.dto';

/**
 * Controller quản lý tính lương và kỳ lương
 */
@ApiTags('Payroll - Tính lương')
@ApiBearerAuth()
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  /**
   * Tính lương cho toàn bộ nhân viên trong kỳ
   */
  @Post('calculate')
  @ApiOperation({ summary: 'Tính lương cho kỳ lương' })
  async calculatePayroll(@Body() dto: CalculatePayrollDto) {
    return this.payrollService.calculatePayroll(dto);
  }

  /**
   * Danh sách các kỳ lương
   */
  @Get()
  @ApiOperation({ summary: 'Danh sách kỳ lương' })
  async listPeriods(@Query() filter: FilterPayrollDto) {
    return this.payrollService.listPeriods(filter);
  }

  /**
   * Chi tiết kỳ lương (tất cả bản ghi nhân viên)
   */
  @Get(':periodId')
  @ApiOperation({ summary: 'Chi tiết kỳ lương' })
  async getPeriodDetail(@Param('periodId') periodId: string) {
    return this.payrollService.getPeriodDetail(periodId);
  }

  /**
   * Phiếu lương của nhân viên trong kỳ
   */
  @Get(':periodId/employee/:employeeId')
  @ApiOperation({ summary: 'Phiếu lương nhân viên' })
  async getPayslip(
    @Param('periodId') periodId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.payrollService.getPayslip(periodId, employeeId);
  }

  /**
   * Xác nhận kỳ lương (chuyển trạng thái → CONFIRMED)
   */
  @Patch(':periodId/confirm')
  @ApiOperation({ summary: 'Xác nhận kỳ lương' })
  async confirmPeriod(@Param('periodId') periodId: string) {
    return this.payrollService.confirmPeriod(periodId);
  }

  /**
   * Thống kê lương theo tháng (tổng quỹ lương, theo phòng ban)
   */
  @Get('stats')
  @ApiOperation({ summary: 'Thống kê lương theo tháng' })
  async getStats(@Query('month') month: number, @Query('year') year: number) {
    return this.payrollService.getMonthlyStats(month, year);
  }

  /**
   * Xuất dữ liệu kỳ lương
   */
  @Get(':periodId/export')
  @ApiOperation({ summary: 'Xuất dữ liệu kỳ lương' })
  async exportPeriod(@Param('periodId') periodId: string) {
    return this.payrollService.exportPeriodData(periodId);
  }

  // ===== NATS Message Handlers =====

  /**
   * Xử lý yêu cầu tính lương qua NATS
   */
  @MessagePattern('payroll.calculate')
  async handleCalculatePayroll(@Payload() data: CalculatePayrollDto) {
    return this.payrollService.calculatePayroll(data);
  }

  /**
   * Lấy phiếu lương qua NATS
   */
  @MessagePattern('payroll.getPayslip')
  async handleGetPayslip(@Payload() data: { periodId: string; employeeId: string }) {
    return this.payrollService.getPayslip(data.periodId, data.employeeId);
  }

  /**
   * Lấy thống kê qua NATS
   */
  @MessagePattern('payroll.stats')
  async handleGetStats(@Payload() data: { month: number; year: number }) {
    return this.payrollService.getMonthlyStats(data.month, data.year);
  }
}
