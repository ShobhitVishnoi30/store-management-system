import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ConfigService } from '@nestjs/config';
import * as hpp from 'hpp';
import helmet from 'helmet';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<string>('PORT') || 3000;

  app.enableCors();

  app.use(hpp());

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: [
            "'self'",
            // "data:",
            // "blob:",
            'https://*.cloudflare.com',
            `http://localhost:${port}/`,
            // "ws:",
          ],
          baseUri: ["'self'"],
          scriptSrc: [
            'self',
            `http://localhost:${port}/`,
            `http://127.0.0.1:${port}/`,
            'https://*.cloudflare.com',
            'https://polyfill.io',
            // "http:",
            // "data:",
          ],
          styleSrc: ['self', 'https:', 'http:', 'unsafe-inline'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          childSrc: ["'self'", 'blob:'],
          styleSrcAttr: ["'self'", 'unsafe-inline', 'http:'],
          frameSrc: ["'self'"],
        },
      },
    }),
  );

  // reading url params and data from body to req.params and req.body
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(express.json({ limit: '10kb' })); // for bodyParser

  //also use body parser here itself remove other custom middle ware

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .addOAuth2()
    .setTitle('Store Management')
    .setDescription('Store Management System')
    .setVersion('1.0')
    .addTag('store')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
