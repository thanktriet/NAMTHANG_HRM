import { Controller, Get, Query } from '@nestjs/common';
import { KpiService } from './kpi.service';

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('evaluations')
  async getEvaluations(
    @Query('period') period?: string,
    @Query('search') search?: string,
  ) {
    return this.kpiService.getEvaluations(period, search);
  }

  @Get('stats')
  async getStats() {
    return this.kpiService.getStats();
  }
}
