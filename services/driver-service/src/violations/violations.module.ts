import { Module } from '@nestjs/common';
import { ViolationsController } from './violations.controller';
import { ViolationsService } from './violations.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ViolationsController],
  providers: [ViolationsService, PrismaService],
  exports: [ViolationsService],
})
export class ViolationsModule {}
