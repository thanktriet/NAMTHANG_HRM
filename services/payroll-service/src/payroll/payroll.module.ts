import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { TaxCalculator } from './calculations/tax-calculator';
import { InsuranceCalculator } from './calculations/insurance-calculator';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [PayrollController],
  providers: [PayrollService, TaxCalculator, InsuranceCalculator, PrismaService],
  exports: [PayrollService],
})
export class PayrollModule {}
