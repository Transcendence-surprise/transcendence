import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersHttpService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.BACKEND_URL ?? 'http://backend:3000',
      timeout: 5000,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersHttpService],
  exports: [UsersHttpService],
})
export class UsersHttpModule {}
