import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../prisma.service';

/**
 * Module quản lý cấp phát tài sản
 * - Đăng ký controller và service cho chức năng cấp phát
 * - Import PrismaService để truy cập database
 */
@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService, PrismaService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
