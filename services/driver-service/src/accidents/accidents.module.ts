import { Module } from '@nestjs/common';
import { AccidentsController } from './accidents.controller';
import { AccidentsService } from './accidents.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [AccidentsController],
  providers: [AccidentsService, PrismaService],
  exports: [AccidentsService],
})
export class AccidentsModule {}
