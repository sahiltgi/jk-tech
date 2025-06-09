import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that are not defined in the DTO
    transform: true, // Automatically transforms payloads to DTO instances
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
  }));

  // Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('JK Tech API')
    .setDescription('API documentation for User and Document Management System')
    .setVersion('1.0')
    .addBearerAuth() // For JWT authentication
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // API docs will be available at /api

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at ${await app.getUrl()}/api`);
}
bootstrap();

