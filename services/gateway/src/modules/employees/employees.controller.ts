import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }),
  )
  async uploadDocument(
    @Param('id') id: string,
    @Body() body: { document_type: string },
    @UploadedFile()
    file: { originalname: string; buffer: Buffer; size: number; mimetype: string },
  ) {
    return this.employeesService.uploadDocument(id, body.document_type, file);
  }

  @Delete(':id/documents/:docId')
  async deleteDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return this.employeesService.deleteDocument(id, docId);
  }
}
