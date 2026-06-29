import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { FilterLicenseDto } from './dto/filter-license.dto';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  /** Danh sách GPLX với bộ lọc */
  @Get()
  findAll(@Query() filter: FilterLicenseDto) {
    return this.licensesService.findAll(filter);
  }

  /** Danh sách GPLX sắp hết hạn trong 30 ngày */
  @Get('expiring')
  findExpiring() {
    return this.licensesService.findExpiring();
  }

  /** Chi tiết GPLX */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licensesService.findOne(id);
  }

  /** Tạo mới GPLX */
  @Post()
  create(@Body() dto: CreateLicenseDto) {
    return this.licensesService.create(dto);
  }

  /** Cập nhật GPLX */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateLicenseDto>) {
    return this.licensesService.update(id, dto);
  }

  /** Ghi nhận gia hạn GPLX */
  @Patch(':id/renew')
  renew(@Param('id') id: string, @Body() dto: { newExpiryDate: string }) {
    return this.licensesService.renew(id, dto.newExpiryDate);
  }
}
