import { DynamicModule, Module } from '@nestjs/common';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import gatewayConfig from './common/config/gateway.config';
import { HealthController } from './health/health.controller';
import { AuthHttpModule } from './modules/auth/auth.module';
import { UsersHttpModule } from './modules/users/users.module';
import { GameModule } from './modules/game/game.module';
import { ImagesHttpModule } from './modules/images/images.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { MatchesModule } from './modules/matches/matches.module';
import { BadgeModule } from './modules/badges/badge.module';
import { FriendHttpModule } from './modules/friends/friend.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { PresenceModule } from './modules/presence/presence.module';
import { ChatHttpModule } from './modules/chat/chat.module';
import { GuardModule } from './common/guards/internal.guard.module';
import { loadVaultSecrets } from './vault';

@Module({})
class VaultConfigModule {
  static async forRootAsync(): Promise<DynamicModule> {
    await loadVaultSecrets();

    return {
      module: VaultConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [gatewayConfig],
        }),
      ],
      exports: [ConfigModule],
    };
  }
}

@Module({
  imports: [
    VaultConfigModule.forRootAsync(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(5),
          limit: 20,
        },
      ],
    }),
    AuthHttpModule,
    UsersHttpModule,
    GameModule,
    ImagesHttpModule,
    LeaderboardModule,
    MatchesModule,
    BadgeModule,
    FriendHttpModule,
    RealtimeModule,
    PresenceModule,
    ChatHttpModule,
    GuardModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
