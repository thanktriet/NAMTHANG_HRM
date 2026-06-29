import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { AssetsModule } from './modules/assets/assets.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // Load biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // JWT Module - cấu hình global
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),

    // Feature modules
    AuthModule,
    CandidatesModule,
    EmployeesModule,
    DashboardModule,
    ContractsModule,
    AttendanceModule,
    DriversModule,
    AssetsModule,
    KpiModule,
    PayrollModule,
  ],
  providers: [
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
