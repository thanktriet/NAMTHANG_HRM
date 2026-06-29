import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tạo ứng dụng HTTP
  const app = await NestFactory.create(AppModule);

  // Kết nối NATS microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
      queue: 'attendance-service',
    },
  });

  // Cấu hình ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Khởi động tất cả microservices
  await app.startAllMicroservices();

  // Lắng nghe HTTP trên port 4003
  await app.listen(4003);
  console.log('Attendance Service đang chạy tại http://localhost:4003');
}
bootstrap();
