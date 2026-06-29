import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

  // Kết nối database khi module được khởi tạo
  async onModuleInit() {
    await this.$connect();
    console.log('[Prisma] Đã kết nối database');
  }

  // Ngắt kết nối khi module bị hủy
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('[Prisma] Đã ngắt kết nối database');
  }
}
