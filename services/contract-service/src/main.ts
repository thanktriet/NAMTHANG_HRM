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
      queue: 'contract-service',
    },
  });

  // Cấu hình validation pipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Bật CORS
  app.enableCors();

  // Khởi động tất cả microservices
  await app.startAllMicroservices();

  // Lắng nghe HTTP trên port 4005
  const port = process.env.PORT || 4005;
  await app.listen(port);
  console.log(`[Contract Service] HTTP đang chạy tại port ${port}`);
  console.log(`[Contract Service] NATS microservice đã kết nối`);
}
bootstrap();
