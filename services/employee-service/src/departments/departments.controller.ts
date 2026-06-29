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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  /** Lấy danh sách phòng ban dạng cây */
  @Get()
  findAll(@Query('tree') tree?: string) {
    if (tree === 'true') {
      return this.departmentsService.findAllTree();
    }
    return this.departmentsService.findAll();
  }

  /** Chi tiết phòng ban kèm số lượng nhân viên */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  /** Tạo phòng ban */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  /** Cập nhật phòng ban */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateDepartmentDto>) {
    return this.departmentsService.update(id, updateDto);
  }

  /** Xóa phòng ban */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
