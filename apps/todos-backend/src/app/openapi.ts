import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerPath = 'api/docs';

export const createOpenApiDocument = (app: INestApplication) =>
  SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Todos Backend API')
      .setDescription('API for boards, columns, cards, and users.')
      .setVersion('1.0.0')
      .build()
  );
