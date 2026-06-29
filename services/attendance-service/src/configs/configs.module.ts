import { Module } from '@nestjs/common';
import { ConfigsController } from './configs.controller';
import { ConfigsService } from './configs.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ConfigsController],
  providers: [ConfigsService, PrismaService],
  exports: [ConfigsService],
})
export class ConfigsModule {}
