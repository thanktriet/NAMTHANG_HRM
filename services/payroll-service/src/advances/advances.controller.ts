import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdvancesService } from './advances.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';
import { FilterAdvanceDto } from './dto/filter-advance.dto';

/**
 * Controller quản lý tạm ứng lương
 */
@ApiTags('Advances - Tạm ứng')
@ApiBearerAuth()
@Controller('advances')
export class AdvancesController {
  constructor(private readonly advancesService: AdvancesService) {}

  /**
   * Tạo yêu cầu tạm ứng
   */
  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu tạm ứng' })
  async create(@Body() dto: CreateAdvanceDto) {
    return this.advancesService.create(dto);
  }

  /**
   * Danh sách tạm ứng (lọc theo trạng thái, nhân viên)
   */
  @Get()
  @ApiOperation({ summary: 'Danh sách tạm ứng' })
  async findAll(@Query() filter: FilterAdvanceDto) {
    return this.advancesService.findAll(filter);
  }

  /**
   * Duyệt yêu cầu tạm ứng
   */
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Duyệt tạm ứng' })
  async approve(@Param('id') id: string) {
    return this.advancesService.approve(id);
  }

  /**
   * Từ chối yêu cầu tạm ứng
   */
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Từ chối tạm ứng' })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.advancesService.reject(id, reason);
  }

  // ===== NATS Message Handlers =====

  @MessagePattern('advances.create')
  async handleCreate(@Payload() data: CreateAdvanceDto) {
    return this.advancesService.create(data);
  }

  @MessagePattern('advances.approve')
  async handleApprove(@Payload() data: { id: string }) {
    return this.advancesService.approve(data.id);
  }

  @MessagePattern('advances.getByEmployee')
  async handleGetByEmployee(@Payload() data: { employeeId: string; month: number; year: number }) {
    return this.advancesService.getApprovedByEmployee(data.employeeId, data.month, data.year);
  }
}
