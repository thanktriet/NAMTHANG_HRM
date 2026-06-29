import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  // Khởi tạo ứng dụng HTTP
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Cấu hình ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Kết nối microservice NATS
  const natsUrl = configService.get<string>('NATS_URL', 'nats://localhost:4222');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [natsUrl],
      queue: 'kpi_queue',
    },
  });

  // Khởi động tất cả microservices
  await app.startAllMicroservices();

  // Khởi động HTTP server trên port 4008
  const port = configService.get<number>('PORT', 4008);
  await app.listen(port);

  console.log(`[KPI Service] HTTP đang chạy tại port ${port}`);
  console.log(`[KPI Service] NATS microservice đã kết nối tại ${natsUrl}`);
}

bootstrap();
