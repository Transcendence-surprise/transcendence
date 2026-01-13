import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication, } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config(); // reads backend/.env when you run from backend/

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Transcendence API')
    .setDescription('Game engine endpoints')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app as unknown as any, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, '0.0.0.0');
  console.log('Server running on http://localhost:3000');
  console.log('Swagger docs on http://localhost:3000/api');
}
bootstrap();
