import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import * as path from 'path';

async function bootstrap() {
  // Configure Winston logger
  const logger = WinstonModule.createLogger({
    transports: [
      // Console logging
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      // File logging
      new winston.transports.File({
        dirname: 'logs',
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      new winston.transports.File({
        dirname: 'logs',
        filename: 'combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
    ],
  });

  logger.log('Starting Starter Template API...');
  logger.log(`Environment: ${process.env.NODE_ENV}`);

  const app = await NestFactory.create(AppModule, {
    logger, // Use Winston logger
  });

  const port = process.env.PORT || 3001;
  logger.log(`Server starting on port ${port}`);

  // Enable CORS in development

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      'http://localhost:4201',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Tenant-ID'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable validation pipe globally
  app.useGlobalPipes(new ValidationPipe());

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Starter Template API')
    .setDescription('Backend API for Starter Template')
    .setVersion('1.0')
    .addTag('API', 'Tenant, users and auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`Server running on port ${port}`);
}
bootstrap();
