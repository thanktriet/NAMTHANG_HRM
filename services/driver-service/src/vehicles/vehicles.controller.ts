import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /** Danh sách phương tiện */
  @Get()
  findAll(@Query() query: any) {
    return this.vehiclesService.findAll(query);
  }

  /** Danh sách phương tiện khả dụng */
  @Get('available')
  findAvailable() {
    return this.vehiclesService.findAvailable();
  }

  /** Chi tiết phương tiện */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  /** Tạo mới phương tiện */
  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  /** Cập nhật phương tiện */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateVehicleDto>) {
    return this.vehiclesService.update(id, dto);
  }

  /** Cập nhật trạng thái phương tiện */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: { status: string }) {
    return this.vehiclesService.updateStatus(id, dto.status);
  }

  /** Xóa phương tiện */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
