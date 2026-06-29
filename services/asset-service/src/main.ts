import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tạo ứng dụng HTTP
  const app = await NestFactory.create(AppModule);

  // Cấu hình validation pipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Kết nối microservice NATS
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
      queue: 'asset-service',
    },
  });

  // Khởi động tất cả microservice
  await app.startAllMicroservices();

  // Lắng nghe HTTP trên cổng 4007
  await app.listen(4007);
  console.log('Asset Service đang chạy trên cổng 4007');
  console.log('NATS microservice đã kết nối tại nats://localhost:4222');
}

bootstrap();
