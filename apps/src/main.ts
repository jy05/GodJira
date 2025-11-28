import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  // Set the default timezone to CST (America/Chicago)
  process.env.TZ = 'America/Chicago';
  
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression.default());
  app.use(cookieParser.default());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
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

  // API prefix (exclude health endpoint)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('GodJira API')
    .setDescription('Enterprise-grade JIRA clone API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('projects', 'Project management')
    .addTag('sprints', 'Sprint management')
    .addTag('issues', 'Issue/ticket management')
    .addTag('comments', 'Comment management')
    .addTag('worklogs', 'Work log tracking')
    .addTag('issue-links', 'Issue linking and relationships')
    .addTag('audit', 'Audit logs and activity feed')
    .addTag('watchers', 'Issue watchers and notifications')
    .addTag('teams', 'Team management and collaboration')
    .addTag('notifications', 'Real-time notifications via WebSocket')
    .addTag('analytics', 'Reports, charts, and analytics')
    .addTag('attachments', 'File attachments for issues')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 GodJira API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
