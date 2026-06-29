import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Khởi tạo HTTP server
  const app = await NestFactory.create(AppModule);

  // Cấu hình NATS microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
      queue: 'driver-service',
    },
  });

  // Cấu hình validation pipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Prefix cho API
  app.setGlobalPrefix('api/v1');

  // Khởi động tất cả microservices
  await app.startAllMicroservices();

  // Lắng nghe trên port 4006
  await app.listen(4006);
  console.log('Driver Service đang chạy trên port 4006');
}
bootstrap();
