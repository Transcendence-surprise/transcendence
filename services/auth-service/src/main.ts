import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.AUTH_SERVICE_PORT ?? 3001);
}
bootstrap().catch((error) => {
  console.error('Failed to start auth-service:', error);
  process.exit(1);
});
