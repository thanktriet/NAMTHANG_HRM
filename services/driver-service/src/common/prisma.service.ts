import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service - Quản lý kết nối database
 * Sử dụng singleton pattern cho toàn bộ ứng dụng
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  /** Kết nối database khi module khởi tạo */
  async onModuleInit() {
    await this.$connect();
  }

  /** Ngắt kết nối khi module bị hủy */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
