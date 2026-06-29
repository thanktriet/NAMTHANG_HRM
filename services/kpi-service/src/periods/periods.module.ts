import { Module } from '@nestjs/common';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';
import { PrismaService } from '../common/prisma.service';

/**
 * Module quản lý kỳ đánh giá KPI
 */
@Module({
  controllers: [PeriodsController],
  providers: [PeriodsService, PrismaService],
  exports: [PeriodsService],
})
export class PeriodsModule {}
