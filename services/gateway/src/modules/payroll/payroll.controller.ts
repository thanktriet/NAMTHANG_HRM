import { Controller, Get, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Controller('payroll')
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
  async getStats() {
    return this.payrollService.getStats();
  }
}
