// src/game/modules/game-engine.module.ts

import { Module } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '@transcendence/db-entities';
import { GamePlayer } from '@transcendence/db-entities';
import { User } from '@transcendence/db-entities';
import { Image } from '@transcendence/db-entities';
import { GamePersistenceService } from '../services/gamePersistence.service';
import { PlayersPersistenceService } from '../services/playersPersistence.service';
import { UserUpdateService } from '../services/userStateUpdate.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GamePlayer, User, Image]),
  ],
  providers: [
    EngineService,
    GamePersistenceService,
    PlayersPersistenceService,
    UserUpdateService
  ],
  exports: [
    EngineService,
    GamePersistenceService,
    PlayersPersistenceService,
    UserUpdateService
  ],
})
export class GameEngineModule {}
