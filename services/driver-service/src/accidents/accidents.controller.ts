import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { AccidentsService } from './accidents.service';
import { CreateAccidentDto } from './dto/create-accident.dto';

@Controller('accidents')
export class AccidentsController {
  constructor(private readonly accidentsService: AccidentsService) {}

  /** Danh sách tai nạn */
  @Get()
  findAll(@Query() query: any) {
    return this.accidentsService.findAll(query);
  }

  /** Chi tiết tai nạn */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accidentsService.findOne(id);
  }

  /** Tạo mới báo cáo tai nạn */
  @Post()
  create(@Body() dto: CreateAccidentDto) {
    return this.accidentsService.create(dto);
  }

  /** Cập nhật báo cáo tai nạn */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateAccidentDto>) {
    return this.accidentsService.update(id, dto);
  }

  /** Xóa báo cáo tai nạn */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accidentsService.remove(id);
  }
}
