import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

/**
 * Controller quản lý đánh giá ứng viên
 */
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  /**
   * Tạo đánh giá mới cho ứng viên
   */
  @Post()
  async create(@Body() createDto: CreateEvaluationDto) {
    return this.evaluationsService.create(createDto);
  }

  /**
   * Lấy tất cả đánh giá của một ứng viên
   */
  @Get('candidate/:candidateId')
  async findByCandidateId(@Param('candidateId') candidateId: string) {
    return this.evaluationsService.findByCandidateId(candidateId);
  }

  /**
   * Chi tiết đánh giá
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }
}
