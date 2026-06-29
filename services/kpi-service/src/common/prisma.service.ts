import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service quản lý kết nối Prisma ORM
 * Tự động kết nối khi module khởi tạo và ngắt kết nối khi module bị hủy
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  /**
   * Kết nối database khi module được khởi tạo
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log('[Prisma] Đã kết nối database thành công');
  }

  /**
   * Ngắt kết nối database khi module bị hủy
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    console.log('[Prisma] Đã ngắt kết nối database');
  }
}
