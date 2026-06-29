import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TemplatesModule } from './templates/templates.module';
import { GeneratedModule } from './generated/generated.module';
import { PrismaService } from './common/prisma.service';
import { MinioService } from './common/minio.service';

/**
 * Module gốc của ứng dụng Document Service
 * Đăng ký tất cả các module con và cấu hình chung
 */
@Module({
  imports: [
    // Cấu hình biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TemplatesModule,
    GeneratedModule,
  ],
  providers: [PrismaService, MinioService],
  exports: [PrismaService, MinioService],
})
export class AppModule {}
