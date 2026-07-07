import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.candidatesService.findAll(status, search, user);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@CurrentUser() user: any) {
    return this.candidatesService.getStats(user);
  }

  @Get('lookup')
  async lookup(@Query('code') code: string, @Query('phone') phone: string) {
    return this.candidatesService.lookup(code, phone);
  }

  @Post()
  async create(@Body() body: any) {
    return this.candidatesService.create(body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.candidatesService.findOne(id, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
    @CurrentUser() user: any,
  ) {
    return this.candidatesService.updateStatus(id, body.status, body.notes, user);
  }

  /**
   * Danh sách giấy tờ của ứng viên (cho HRM hiển thị)
   */
  @Get(':id/documents')
  @UseGuards(JwtAuthGuard)
  async getDocuments(@Param('id') id: string, @CurrentUser() user: any) {
    return this.candidatesService.getDocuments(id, user);
  }

  /**
   * Upload giấy tờ/ảnh (public - từ landing page).
   * FormData: files[] + types[] (khớp thứ tự file -> document_type).
   */
  @Post(':id/documents')
  @UseInterceptors(
    FilesInterceptor('files', 12, {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB/file
    }),
  )
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Array<{ originalname: string; buffer: Buffer; size: number; mimetype: string }>,
    @Body() body: { types?: string | string[] },
  ) {
    const types = Array.isArray(body.types)
      ? body.types
      : body.types
        ? [body.types]
        : [];
    return this.candidatesService.uploadDocuments(id, files, types);
  }

  @Post(":id/convert-to-employee")
  async convertToEmployee(@Param("id") id: string, @Body() body: { department_id?: string; position_id?: string; status?: string }) {
    return this.candidatesService.convertToEmployee(id, body || {});
  }

  @Get("meta/departments")
  async listDepartments() {
    return this.candidatesService.listDepartments();
  }

  @Get("meta/positions")
  async listPositions() {
    return this.candidatesService.listPositions();
  }
}
