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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { LookupCandidateDto } from './dto/lookup-candidate.dto';

/**
 * Controller quản lý ứng viên tuyển dụng
 */
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  /**
   * Nộp đơn ứng tuyển (public - từ landing page)
   */
  @Post()
  async create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  /**
   * Danh sách ứng viên với bộ lọc
   */
  @Get()
  async findAll(@Query() filterDto: FilterCandidateDto) {
    return this.candidatesService.findAll(filterDto);
  }

  /**
   * Thống kê pipeline tuyển dụng
   */
  @Get('stats')
  async getStats() {
    return this.candidatesService.getPipelineStats();
  }

  /**
   * Tra cứu hồ sơ công khai (theo mã + SĐT)
   */
  @Get('lookup')
  async lookup(@Query() lookupDto: LookupCandidateDto) {
    return this.candidatesService.lookup(lookupDto);
  }

  /**
   * Chi tiết ứng viên
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  /**
   * Cập nhật trạng thái ứng viên
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.candidatesService.updateStatus(id, updateStatusDto);
  }

  /**
   * Upload tài liệu cho ứng viên (CMND, bằng lái, CV...)
   */
  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.candidatesService.uploadDocuments(id, files);
  }

  /**
   * Lắng nghe event từ các service khác qua NATS
   */
  @MessagePattern('candidate.get')
  async handleGetCandidate(@Payload() data: { id: string }) {
    return this.candidatesService.findOne(data.id);
  }
}
