import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tạo ứng dụng HTTP hybrid
  const app = await NestFactory.create(AppModule);

  // Cấu hình validation pipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Kết nối NATS microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
      queue: 'document-service',
    },
  });

  // Khởi động tất cả microservice
  await app.startAllMicroservices();

  // Lắng nghe HTTP trên cổng 4009
  await app.listen(4009);
  console.log('Document Service đang chạy trên cổng 4009');
}

bootstrap();
