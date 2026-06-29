import { Module } from '@nestjs/common';
import { LicensesModule } from './licenses/licenses.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { ViolationsModule } from './violations/violations.module';
import { AccidentsModule } from './accidents/accidents.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    LicensesModule,
    VehiclesModule,
    AssignmentsModule,
    DispatchModule,
    ViolationsModule,
    AccidentsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
