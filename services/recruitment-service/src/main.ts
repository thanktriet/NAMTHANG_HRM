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
      queue: 'recruitment-service',
    },
  });

  // Cấu hình validation pipe toàn cục
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

  // Cấu hình CORS
  app.enableCors();

  // Khởi động tất cả microservices
  await app.startAllMicroservices();

  // Lắng nghe HTTP trên port 4001
  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`🚀 Recruitment Service đang chạy tại http://localhost:${port}`);
  console.log(`📡 NATS Microservice đã kết nối`);
}
bootstrap();
