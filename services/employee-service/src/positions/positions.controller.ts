import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  /** Danh sách chức vụ */
  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  /** Chi tiết chức vụ */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  /** Tạo chức vụ */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  /** Cập nhật chức vụ */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreatePositionDto>) {
    return this.positionsService.update(id, updateDto);
  }

  /** Xóa chức vụ */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
