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
    .setTitle('Authentication API')
    .setDescription(
      'Microservice for user authentication and JWT token generation',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'User login and token management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/auth/docs', app, document, {
    customSiteTitle: 'Auth API Docs',
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      persistAuthorization: true,
    },
  });

  const port = process.env.AUTH_SERVICE_PORT ?? '3001';
  await app.listen(port, '0.0.0.0');
  console.log(`Auth Service running on ${process.env.AUTH_SERVICE_URL}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start auth-service:', error);
  process.exit(1);
});
