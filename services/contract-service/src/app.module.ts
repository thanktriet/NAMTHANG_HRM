import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractsModule } from './contracts/contracts.module';
import { TemplatesModule } from './templates/templates.module';
import { GeneratorsModule } from './generators/generators.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ContractsModule,
    TemplatesModule,
    GeneratorsModule,
  ],
})
export class AppModule {}
