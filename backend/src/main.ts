import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication, } from '@nestjs/platform-fastify';

if (process.env.APP_ENV !== 'production') {
  require('dotenv').config();
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
