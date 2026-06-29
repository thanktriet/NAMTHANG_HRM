import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service quản lý kết nối Prisma đến cơ sở dữ liệu
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Kết nối đến cơ sở dữ liệu khi module được khởi tạo
    await this.$connect();
  }

  async onModuleDestroy() {
    // Ngắt kết nối khi module bị hủy
    await this.$disconnect();
  }
}
