import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service quản lý kết nối Prisma
 * Tự động kết nối khi module khởi tạo và ngắt kết nối khi module bị huỷ
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /** Kết nối đến cơ sở dữ liệu khi module khởi tạo */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /** Ngắt kết nối khi module bị huỷ */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
