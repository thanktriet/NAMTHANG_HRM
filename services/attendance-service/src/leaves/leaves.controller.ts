import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { FilterLeaveDto } from './dto/filter-leave.dto';

/**
 * Controller quản lý nghỉ phép
 */
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  /**
   * Tạo đơn nghỉ phép
   */
  @Post()
  async create(@Body() dto: CreateLeaveDto) {
    return this.leavesService.create(dto);
  }

  /**
   * Lấy danh sách đơn nghỉ phép
   */
  @Get()
  async findAll(@Query() filter: FilterLeaveDto) {
    return this.leavesService.findAll(filter);
  }

  /**
   * Duyệt đơn nghỉ phép
   */
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.leavesService.approve(id);
  }

  /**
   * Từ chối đơn nghỉ phép
   */
  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    return this.leavesService.reject(id);
  }

  /**
   * Lấy số ngày phép còn lại của nhân viên
   */
  @Get('balance/:employeeId')
  async getBalance(@Param('employeeId') employeeId: string) {
    return this.leavesService.getLeaveBalance(employeeId);
  }

  // === NATS Message Handlers ===

  @MessagePattern('leaves.create')
  async handleCreate(@Payload() dto: CreateLeaveDto) {
    return this.leavesService.create(dto);
  }

  @MessagePattern('leaves.approve')
  async handleApprove(@Payload() data: { id: string }) {
    return this.leavesService.approve(data.id);
  }

  @MessagePattern('leaves.reject')
  async handleReject(@Payload() data: { id: string }) {
    return this.leavesService.reject(data.id);
  }

  @MessagePattern('leaves.balance')
  async handleBalance(@Payload() data: { employeeId: string }) {
    return this.leavesService.getLeaveBalance(data.employeeId);
  }
}
