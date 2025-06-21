import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration des pipes globaux
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configuration CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3001'
    ],
    credentials: true,
  });

  // Préfixe API
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('MyTzedaka API')
    .setDescription('API documentation for the multi-tenant donation platform for Jewish communities')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('admin', 'Admin management endpoints')
    .addTag('hub', 'Hub central endpoints (cross-tenant)')
    .addTag('tenant', 'Tenant management endpoints')
    .addTag('donor-portal', 'Donor portal endpoints')
    .addTag('donations', 'Donation processing endpoints')
    .addTag('campaigns', 'Campaign management endpoints')
    .addTag('stripe', 'Stripe integration endpoints')
    .addTag('tax-receipt', 'Tax receipt generation endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Tenant-ID',
        in: 'header',
        description: 'Tenant ID for multi-tenant operations',
      },
      'tenant-header',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'MyTzedaka API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API endpoints available at: http://localhost:${port}/api`);
  console.log(`📖 Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
