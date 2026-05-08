import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import setupMergedSwagger from './swagger/merge-swagger';
import fastifyCookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { AxiosExceptionFilter } from './common/filters/axios-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      routerOptions: {
        ignoreTrailingSlash: true,
      },
      trustProxy: true,
    }),
  );

  await app.register(fastifyCookie);
  await app.register(multipart, {
    limits: {
      fileSize: 104857600, // 104 megabytes
    },
  });

  app.useGlobalFilters(new AxiosExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await setupMergedSwagger(app);

  if (!process.env.GATEWAY_PORT) {
    throw new Error('GATEWAY_PORT must be valid')
  }

  const port = process.env.GATEWAY_PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`gateway running on ${process.env.GATEWAY_URL}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start gateway:', error);
  process.exit(1);
});
