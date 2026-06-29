import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho frontend (cho phép LAN access trong dev)
  app.enableCors({
    origin: true, // Cho phép tất cả origin trong dev
    credentials: true,
  });

  // Global validation pipe - tự động validate DTO
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

  // Prefix cho tất cả API routes
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Gateway đang chạy tại http://0.0.0.0:${port}`);
}
bootstrap();
