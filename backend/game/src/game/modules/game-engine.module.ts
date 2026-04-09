// src/game/modules/game-engine.module.ts

import { Module } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '@transcendence/db-entities';
import { GamePlayer } from '@transcendence/db-entities';


@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GamePlayer]),
  ],
  providers: [EngineService],
  exports: [EngineService],
})
export class GameEngineModule {}
