import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.candidatesService.findAll(status, search);
  }

  @Get('stats')
  async getStats() {
    return this.candidatesService.getStats();
  }

  @Get('lookup')
  async lookup(@Query('code') code: string, @Query('phone') phone: string) {
    return this.candidatesService.lookup(code, phone);
  }

  @Post()
  async create(@Body() body: any) {
    return this.candidatesService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.candidatesService.updateStatus(id, body.status, body.notes);
  }
}
