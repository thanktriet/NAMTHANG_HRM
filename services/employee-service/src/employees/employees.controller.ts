import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FilterEmployeeDto } from './dto/filter-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /** Lấy thống kê nhân viên */
  @Get('stats')
  getStats() {
    return this.employeesService.getStatistics();
  }

  /** Danh sách nhân viên có phân trang và lọc */
  @Get()
  findAll(@Query() filterDto: FilterEmployeeDto) {
    return this.employeesService.findAll(filterDto);
  }

  /** Chi tiết nhân viên */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  /** Tạo nhân viên mới */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  /** Cập nhật thông tin nhân viên */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  /** Xóa mềm nhân viên */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  /** Lấy danh sách thành viên gia đình */
  @Get(':id/family')
  getFamily(@Param('id') id: string) {
    return this.employeesService.getFamily(id);
  }

  /** Thêm thành viên gia đình */
  @Post(':id/family')
  @HttpCode(HttpStatus.CREATED)
  addFamily(@Param('id') id: string, @Body() familyDto: any) {
    return this.employeesService.addFamily(id, familyDto);
  }

  /** Lấy lịch sử công tác */
  @Get(':id/work-history')
  getWorkHistory(@Param('id') id: string) {
    return this.employeesService.getWorkHistory(id);
  }

  // --- NATS Message Handlers ---

  @MessagePattern('employee.findOne')
  handleFindOne(@Payload() data: { id: string }) {
    return this.employeesService.findOne(data.id);
  }

  @MessagePattern('employee.findAll')
  handleFindAll(@Payload() data: FilterEmployeeDto) {
    return this.employeesService.findAll(data);
  }
}
