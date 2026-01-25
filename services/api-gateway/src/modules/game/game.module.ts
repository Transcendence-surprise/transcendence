import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameController } from './game.controller';
import { GameHttpService } from './game.service';

@Module({
  imports: [HttpModule],
  controllers: [GameController],
  providers: [GameHttpService],
  exports: [GameHttpService],
})
export class GameModule {}
