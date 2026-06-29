import { Controller, Get, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.assetsService.findAll(status, category, search);
  }

  @Get('stats')
  async getStats() {
    return this.assetsService.getStats();
  }
}
