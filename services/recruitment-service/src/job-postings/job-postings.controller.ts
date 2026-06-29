import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';

/**
 * Controller quản lý tin tuyển dụng
 */
@Controller('job-postings')
export class JobPostingsController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  /**
   * Tạo tin tuyển dụng mới
   */
  @Post()
  async create(@Body() createDto: CreateJobPostingDto) {
    return this.jobPostingsService.create(createDto);
  }

  /**
   * Danh sách tin tuyển dụng
   */
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.jobPostingsService.findAll({ page, limit, status });
  }

  /**
   * Danh sách tin tuyển dụng đang hoạt động (public)
   */
  @Get('active')
  async findActive() {
    return this.jobPostingsService.findActive();
  }

  /**
   * Chi tiết tin tuyển dụng
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobPostingsService.findOne(id);
  }

  /**
   * Cập nhật tin tuyển dụng
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: CreateJobPostingDto) {
    return this.jobPostingsService.update(id, updateDto);
  }

  /**
   * Cập nhật trạng thái tin tuyển dụng (draft/active/closed)
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.jobPostingsService.updateStatus(id, status);
  }

  /**
   * Xóa tin tuyển dụng
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobPostingsService.remove(id);
  }
}
