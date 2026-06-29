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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /** Danh sách chi nhánh/tổ chức */
  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  /** Chi tiết chi nhánh */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  /** Tạo chi nhánh */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  /** Cập nhật chi nhánh */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateOrganizationDto>) {
    return this.organizationsService.update(id, updateDto);
  }

  /** Xóa chi nhánh */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
