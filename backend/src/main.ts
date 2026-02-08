import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bodyParser: true,
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  // Zwiększ limit body dla uploadów (logo, zdjęcia)
  // WAŻNE: Nie parsuj JSON dla webhooków Stripe - potrzebują raw body
  app.use(require('express').json({ 
    limit: '10mb',
    verify: (req: any, res, buf) => {
      // Zachowaj raw body dla webhooków Stripe
      if (req.originalUrl && req.originalUrl.includes('/webhook')) {
        req.rawBody = buf;
      }
    }
  }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // Serve static files from uploads directory
  // WAŻNE: Musi być PRZED setGlobalPrefix żeby działało bez /api
  const express = require('express');
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://rezerwacja24.pl", "https://*.rezerwacja24.pl"],
      },
    },
    crossOriginEmbedderPolicy: false, // Dla Swagger UI
  }));

  // CORS - Allow only rezerwacja24.pl domains
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allowed domains
      const allowedOrigins = [
        'https://rezerwacja24.pl',
        'https://www.rezerwacja24.pl',
        'https://app.rezerwacja24.pl',
        'https://api.rezerwacja24.pl',
        'https://bookings24.eu',
        'https://www.bookings24.eu',
        'https://app.bookings24.eu',
        'https://api.bookings24.eu',
      ];
      
      // Check if origin matches allowed domains or subdomains
      const isAllowed = allowedOrigins.includes(origin) || 
                       /^https:\/\/[\w-]+\.rezerwacja24\.pl$/.test(origin) ||
                       /^https:\/\/[\w-]+\.bookings24\.eu$/.test(origin);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Tenant-ID', 
      'x-tenant-id',
      'x-user-id', 
      'x-user-email',
      'Accept',
      'Cache-Control',
      'Pragma',
      'Expires'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours
  });

  // Global prefix - wykluczamy /uploads z prefixu /api
  app.setGlobalPrefix('api', {
    exclude: ['/uploads/(.*)', 'uploads/(.*)'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation - tylko w trybie development
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Rezerwacja24 API')
      .setDescription('Multi-tenant Booking System with CRM & Automation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & Authorization')
      .addTag('tenants', 'Tenant Management')
      .addTag('bookings', 'Booking System')
      .addTag('crm', 'Customer Relationship Management')
      .addTag('billing', 'Billing & Subscriptions')
      .addTag('ai', 'AI Features')
      .addTag('notifications', 'Notifications')
      .addTag('marketplace', 'Marketplace')
      .addTag('automations', 'Automations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get('PORT') || 4000;
  await app.listen(port);

  console.log(`
    🚀 Rezerwacja24 API is running!
    
    📡 API: http://localhost:${port}/api
    ${!isProduction ? `📚 Docs: http://localhost:${port}/api/docs` : '📚 Docs: disabled in production'}
    🌍 Environment: ${configService.get('NODE_ENV')}
  `);
}

bootstrap();
