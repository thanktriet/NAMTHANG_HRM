import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service - Quản lý kết nối database
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('📦 Đã kết nối database (Recruitment)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
