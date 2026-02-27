import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) =>
    o.trim(),
  ) || ['http://localhost:3001', 'http://localhost:4200'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Mini Library Management API')
    .setDescription(
      `## Overview
A production-ready REST API for managing a mini library system. Supports book CRUD operations, check-in/check-out workflows, AI-powered metadata suggestions, and role-based access control (RBAC).

## Authentication
This API supports two authentication modes:
- **OIDC/SSO**: Validate JWTs against an external identity provider (production)
- **Dev Auth**: Generate JWTs locally for development and testing

Use the \`POST /api/v1/auth/dev-login\` endpoint to obtain a token, then click **Authorize** above and enter \`Bearer <token>\`.

## Error Format
All errors follow a consistent format:
\`\`\`json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
\`\`\`

## Roles
- **ADMIN**: Full access including delete operations
- **LIBRARIAN**: Book management and check-in/check-out
- **MEMBER**: Read-only access to books and personal profile`,
    )
    .setVersion(process.env.API_VERSION || '1.0.0')
    .setContact(
      'Library API Team',
      'https://github.com/hadiwehbi/mini-library-back',
      'support@library.local',
    )
    .setLicense('ISC', 'https://opensource.org/licenses/ISC')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'bearer',
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Books', 'Book CRUD and check-in/check-out operations')
    .addTag('AI', 'AI-powered library assistant endpoints')
    .addTag('Health', 'Application health and readiness checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Mini Library API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
