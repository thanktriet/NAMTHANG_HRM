import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { PrismaService } from '../common/prisma.service';

/**
 * Module quản lý đánh giá KPI nhân viên
 */
@Module({
  controllers: [EvaluationsController],
  providers: [EvaluationsService, PrismaService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
