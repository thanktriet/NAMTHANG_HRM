import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.contractsService.findAll(type, status, search);
  }

  @Get('stats')
  async getStats() {
    return this.contractsService.getStats();
  }

  @Post()
  async create(@Body() body: any) {
    return this.contractsService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/terminate')
  async terminate(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.contractsService.terminate(id, body.reason);
  }

  @Patch(':id/renew')
  async renew(@Param('id') id: string, @Body() body: { new_end_date: string; new_salary?: number }) {
    return this.contractsService.renew(id, body);
  }
}
