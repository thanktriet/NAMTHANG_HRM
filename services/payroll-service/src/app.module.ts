import { Module } from '@nestjs/common';
import { PayrollModule } from './payroll/payroll.module';
import { AdvancesModule } from './advances/advances.module';
import { CommissionsModule } from './commissions/commissions.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [PayrollModule, AdvancesModule, CommissionsModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
