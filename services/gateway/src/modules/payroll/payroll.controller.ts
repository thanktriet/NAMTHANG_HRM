import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  async findAll(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('search') search?: string,
  ) {
    return this.payrollService.findAll(month, year, search);
  }

  @Get('stats')
  async getStats(@Query('period_id') periodId?: string) {
    return this.payrollService.getStats(periodId);
  }

  // ===== Kỳ lương =====
  @Get('periods')
  async listPeriods() {
    return this.payrollService.listPeriods();
  }

  @Post('periods')
  async createPeriod(@Body() body: { month: number; year: number }) {
    return this.payrollService.createPeriod(body.month, body.year);
  }

  @Post('periods/:id/calculate')
  async calculate(@Param('id') id: string) {
    return this.payrollService.calculate(id);
  }

  @Get('periods/:id/records')
  async getRecords(@Param('id') id: string, @Query('search') search?: string) {
    return this.payrollService.getRecords(id, search);
  }

  @Patch('periods/:id/confirm')
  async confirmPeriod(@Param('id') id: string) {
    return this.payrollService.confirmPeriod(id);
  }

  @Patch('periods/:id/pay')
  async markPaid(@Param('id') id: string) {
    return this.payrollService.markPaid(id);
  }
}
