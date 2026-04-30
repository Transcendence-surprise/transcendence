// src/game/modules/game-engine.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EngineService } from '../services/engine.service.nest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '@transcendence/db-entities';
import { GamePlayer } from '@transcendence/db-entities';
import { User } from '@transcendence/db-entities';
import { Image } from '@transcendence/db-entities';
import { GamePersistenceService } from '../services/gamePersistence.service';
import { PlayersPersistenceService } from '../services/playersPersistence.service';
import { UserUpdateService } from '../services/userStateUpdate.service';
import { GameTimeoutService } from '../services/game-timeout.service';
import { GatewayInternalHTTPService } from '../services/gateway-internal.http.service';
import { CoreBadgeHTTPService } from '../services/core-internal.http.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('game.gateway.baseUrl'),
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    TypeOrmModule.forFeature([Game, GamePlayer, User, Image]),
  ],
  providers: [
    EngineService,
    GameTimeoutService,
    GamePersistenceService,
    PlayersPersistenceService,
    UserUpdateService,
    GatewayInternalHTTPService,
    CoreBadgeHTTPService,
  ],
  exports: [
    EngineService,
    GamePersistenceService,
    PlayersPersistenceService,
    UserUpdateService,
    GatewayInternalHTTPService,
    CoreBadgeHTTPService,
  ],
})
export class GameEngineModule {}
