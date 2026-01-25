import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameController } from './game.controller';
import { GameHttpService } from './game.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.BACKEND_URL ?? 'http://localhost:3000',
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [GameController],
  providers: [GameHttpService],
  exports: [GameHttpService],
})
export class GameModule {}
