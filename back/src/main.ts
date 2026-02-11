import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Seguridad: Headers HTTP con Helmet
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // 2. Parser de cookies (para JWT en httpOnly cookies)
  app.use(cookieParser());

  // 3. Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. CORS configurado para el frontend (sin trailing slash para coincidir con Origin)
  const frontOrigin =
    (process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(
      /\/+$/,
      '',
    ) || 'http://localhost:3000';
  app.enableCors({
    origin: frontOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Set-Cookie',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(process.env.PORT ?? 3080);
  console.log(`🚀 Backend corriendo en http://localhost:${process.env.PORT ?? 3080}`);
}
bootstrap();
