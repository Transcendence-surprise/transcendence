// src/game/modules/game.module.ts

import { Module } from '@nestjs/common';
import { GameController } from '../controllers/game.controller';
import { GameEngineModule } from './game-engine.module';

@Module({
  imports: [GameEngineModule],
  controllers: [GameController],
})
export class GameModule {}