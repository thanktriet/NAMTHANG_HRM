import { Module } from '@nestjs/common';
import { GeneratorsService } from './generators.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [GeneratorsService, PrismaService],
  exports: [GeneratorsService],
})
export class GeneratorsModule {}
