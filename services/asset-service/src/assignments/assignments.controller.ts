import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';

/**
 * Controller quản lý giao/trả tài sản
 */
@Controller('asset-assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /** Giao tài sản cho nhân viên */
  @Post()
  async assign(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.assign(dto);
  }

  /** Lấy danh sách tất cả phiếu giao tài sản */
  @Get()
  async findAll() {
    return this.assignmentsService.findAll();
  }

  /** Trả tài sản và cập nhật tình trạng */
  @Patch(':id/return')
  async returnAsset(
    @Param('id') id: string,
    @Body() dto: ReturnAssetDto,
  ) {
    return this.assignmentsService.returnAsset(id, dto);
  }

  /** Lấy danh sách phiếu giao theo mã nhân viên */
  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.assignmentsService.findByEmployee(employeeId);
  }
}
