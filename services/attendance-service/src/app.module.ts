import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecordsModule } from './records/records.module';
import { ConfigsModule } from './configs/configs.module';
import { LeavesModule } from './leaves/leaves.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RecordsModule,
    ConfigsModule,
    LeavesModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
