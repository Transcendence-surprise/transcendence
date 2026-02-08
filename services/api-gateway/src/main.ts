import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import setupMergedSwagger from './swagger/merge-swagger';
import fastifyCookie from '@fastify/cookie';
import { AxiosExceptionFilter } from './common/filters/axios-exception.filter';

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

  if (!process.env.API_GATEWAY_PORT) {
    throw new Error('API_GATEWAY_PORT must be valid')
  }

  const port = process.env.API_GATEWAY_PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`Api-gateway running on ${process.env.API_GATEWAY_URL}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start api-gateway:', error);
  process.exit(1);
});
