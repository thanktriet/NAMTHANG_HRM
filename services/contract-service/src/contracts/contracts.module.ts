import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../common/prisma.service';
import { GeneratorsModule } from '../generators/generators.module';

@Module({
  imports: [GeneratorsModule],
  controllers: [ContractsController],
  providers: [ContractsService, PrismaService],
  exports: [ContractsService],
})
export class ContractsModule {}
