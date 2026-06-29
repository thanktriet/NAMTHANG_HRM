import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateResultDto } from './dto/update-result.dto';

/**
 * Controller quản lý lịch phỏng vấn
 */
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  /**
   * Lên lịch phỏng vấn
   */
  @Post()
  async create(@Body() createDto: CreateInterviewDto) {
    return this.interviewsService.create(createDto);
  }

  /**
   * Danh sách lịch phỏng vấn
   */
  @Get()
  async findAll(
    @Query('filter') filter?: string, // today, upcoming, past
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.interviewsService.findAll({ filter, page, limit });
  }

  /**
   * Lịch phỏng vấn hôm nay
   */
  @Get('today')
  async findToday() {
    return this.interviewsService.findToday();
  }

  /**
   * Lịch phỏng vấn sắp tới
   */
  @Get('upcoming')
  async findUpcoming() {
    return this.interviewsService.findUpcoming();
  }

  /**
   * Chi tiết lịch phỏng vấn
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  /**
   * Ghi nhận kết quả phỏng vấn
   */
  @Patch(':id/result')
  async updateResult(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
  ) {
    return this.interviewsService.updateResult(id, updateResultDto);
  }
}
