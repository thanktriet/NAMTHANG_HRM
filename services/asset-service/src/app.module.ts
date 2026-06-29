import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetsModule } from './assets/assets.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { PrismaService } from './prisma.service';

/**
 * Module gốc của Asset Service
 * Quản lý tài sản và phân bổ tài sản cho nhân viên
 */
@Module({
  imports: [
    // Cấu hình biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AssetsModule,
    AssignmentsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
