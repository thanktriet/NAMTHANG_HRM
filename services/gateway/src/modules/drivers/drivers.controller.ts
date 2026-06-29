import { Controller, Get, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.driversService.findAll(search);
  }

  @Get('licenses')
  async getLicenses() {
    return this.driversService.getLicenses();
  }

  @Get('licenses/expiring')
  async getExpiringLicenses() {
    return this.driversService.getExpiringLicenses();
  }

  @Get('dispatch')
  async getDispatchOrders() {
    return this.driversService.getDispatchOrders();
  }

  @Get('stats')
  async getStats() {
    return this.driversService.getStats();
  }
}
