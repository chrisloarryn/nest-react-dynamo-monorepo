/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { createOpenApiDocument, swaggerPath } from './app/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const document = createOpenApiDocument(app);
    const outputPath = process.env.OPENAPI_OUTPUT_PATH;

    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Todos Backend API Docs',
      jsonDocumentUrl: `${swaggerPath}-json`,
    });

    if (outputPath) {
      const absoluteOutputPath = resolve(outputPath);
      mkdirSync(dirname(absoluteOutputPath), { recursive: true });
      writeFileSync(absoluteOutputPath, JSON.stringify(document, null, 2), 'utf8');
      Logger.log(`OpenAPI document written to: ${absoluteOutputPath}`);
    }
  }
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
