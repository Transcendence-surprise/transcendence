import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      routerOptions: {
        ignoreTrailingSlash: true,
      },
    }),
  );

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

  const config = new DocumentBuilder()
    .setTitle('Game API')
    .setDescription('Microservice for game engine and service')
    .setVersion('1.0.0')
    .addTag('Game', 'Game engine and service')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/game/docs', app, document, {
    customSiteTitle: 'Auth API Docs',
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      persistAuthorization: true,
    },
  });

  const port = process.env.GAME_PORT ?? '3003';
  await app.listen(port, '0.0.0.0');
  const url = process.env.GAME_URL ?? `http://localhost:${port}`;
  console.log(`Game Service running on ${url}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start game:', error);
  process.exit(1);
});
