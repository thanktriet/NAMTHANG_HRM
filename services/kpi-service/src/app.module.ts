import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './common/prisma.service';
import { PeriodsModule } from './periods/periods.module';
import { TemplatesModule } from './templates/templates.module';
import { EvaluationsModule } from './evaluations/evaluations.module';

@Module({
  imports: [
    // Cấu hình biến môi trường toàn cục
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Các module chức năng KPI
    PeriodsModule,
    TemplatesModule,
    EvaluationsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
