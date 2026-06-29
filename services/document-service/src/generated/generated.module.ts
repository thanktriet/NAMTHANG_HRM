import { Module } from '@nestjs/common';
import { GeneratedController } from './generated.controller';
import { GeneratedService } from './generated.service';
import { PrismaService } from '../common/prisma.service';
import { MinioService } from '../common/minio.service';
import { TemplatesModule } from '../templates/templates.module';

/**
 * Module quản lý tài liệu đã tạo (generated documents)
 */
@Module({
  imports: [TemplatesModule],
  controllers: [GeneratedController],
  providers: [GeneratedService, PrismaService, MinioService],
  exports: [GeneratedService],
})
export class GeneratedModule {}
