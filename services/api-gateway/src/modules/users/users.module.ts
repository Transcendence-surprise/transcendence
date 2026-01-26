import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersHttpService } from './users.service';
import { UsersController } from './users.controller';
import { AuthHttpModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.BACKEND_URL ?? 'http://backend:3000',
      timeout: 5000,
    }),
    AuthHttpModule,
  ],
  controllers: [UsersController],
  providers: [UsersHttpService],
  exports: [UsersHttpService],
})
export class UsersHttpModule {}
