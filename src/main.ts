import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  // Setup raw body parsing for Stripe webhooks
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  // Parse JSON for other routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from uploads directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Use WebSockets
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Colet - API')
    .setDescription('Serviço de Gerenciamento de Coleta de Resíduos')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);

  // Enable CORS for both REST and WebSockets
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
