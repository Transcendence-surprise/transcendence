import { Module } from '@nestjs/common';
import { GameController } from '../controllers/game.controller';
import { GameEngineModule } from './game-engine.module';
import { WsModule } from '../../ws/ws.module';

@Module({
  imports: [GameEngineModule, WsModule,],
  controllers: [GameController],
})
export class GameModule {}