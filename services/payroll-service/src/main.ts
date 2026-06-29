import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Khởi tạo HTTP server
  const app = await NestFactory.create(AppModule);

  // Kết nối NATS microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
      queue: 'payroll-service',
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

  // Cấu hình CORS
  app.enableCors();

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Payroll Service')
    .setDescription('API quản lý tính lương, phiếu lương, tạm ứng, hoa hồng')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Khởi động tất cả microservices
  await app.startAllMicroservices();

  // Lắng nghe HTTP trên port 4004
  const port = process.env.PORT || 4004;
  await app.listen(port);
  console.log(`[Payroll Service] HTTP đang chạy tại port ${port}`);
  console.log(`[Payroll Service] NATS microservice đã kết nối`);
  console.log(`[Payroll Service] Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
