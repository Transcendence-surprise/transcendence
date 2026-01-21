import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      routerOptions: {
        ignoreTrailingSlash: true,
      },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.API_GATEWAY_PORT ?? '3002';
  await app.listen(port, '0.0.0.0');
  console.log(`Api-gateway running on ${process.env.API_GATEWAY_URL}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start api-gateway:', error);
  process.exit(1);
});
