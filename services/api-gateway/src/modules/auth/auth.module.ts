import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthHttpService } from './auth.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [AuthHttpService],
  exports: [AuthHttpService],
})
export class AuthHttpModule {}
