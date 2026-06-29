import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('vehicle-assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /** Gán phương tiện cho lái xe */
  @Post()
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto);
  }

  /** Danh sách phân công phương tiện */
  @Get()
  findAll(@Query() query: any) {
    return this.assignmentsService.findAll(query);
  }

  /** Chi tiết phân công */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  /** Trả phương tiện (giải phóng phân công) */
  @Patch(':id/release')
  release(@Param('id') id: string) {
    return this.assignmentsService.release(id);
  }
}
