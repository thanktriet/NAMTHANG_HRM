import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TransfersModule } from './transfers/transfers.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
    OrganizationsModule,
    TransfersModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
