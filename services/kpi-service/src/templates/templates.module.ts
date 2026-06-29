import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../common/prisma.service';

/**
 * Module quản lý mẫu KPI theo vị trí
 */
@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, PrismaService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
