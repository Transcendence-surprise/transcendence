import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { AxiosExceptionFilter } from './common/filters/axios-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      routerOptions: {
        ignoreTrailingSlash: true,
      },
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

  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription(
      'Microservice for user authentication and JWT token generation',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'User login and token management')
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api/auth/docs', app, document, {
    customSiteTitle: 'Auth API Docs',
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      persistAuthorization: true,
    },
  });

  if (!process.env.AUTH_SERVICE_PORT) {
    throw new Error('AUTH_SERVICE_PORT must be valid')
  }

  const port = process.env.AUTH_SERVICE_PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`Auth Service running on ${process.env.AUTH_SERVICE_URL}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start auth-service:', error);
  process.exit(1);
});
