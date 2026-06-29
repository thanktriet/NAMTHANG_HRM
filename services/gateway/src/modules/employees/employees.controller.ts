import { Controller, Get, Post, Patch, Query, Param, Body } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.employeesService.findAll(departmentId, status, search);
  }

  @Get('stats')
  async getStats() {
    return this.employeesService.getStats();
  }

  @Get('documents/missing')
  async getMissingDocuments() {
    return this.employeesService.getMissingDocuments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.update(id, body);
  }

  @Get(':id/rewards')
  async getRewards(@Param('id') id: string) {
    return this.employeesService.getRewards(id);
  }

  @Post(':id/rewards')
  async addReward(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.addReward(id, body);
  }

  @Get(':id/contracts')
  async getContracts(@Param('id') id: string) {
    return this.employeesService.getContracts(id);
  }

  @Get(':id/documents')
  async getDocuments(@Param('id') id: string) {
    return this.employeesService.getDocuments(id);
  }

  @Post(':id/documents')
  async uploadDocument(
    @Param('id') id: string,
    @Body() body: { document_type: string; file_name: string; file_path: string },
  ) {
    return this.employeesService.uploadDocument(id, body);
  }
}
