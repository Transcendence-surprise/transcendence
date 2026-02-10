import { Module } from '@nestjs/common';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import gatewayConfig from './common/config/gateway.config';
import { HealthController } from './health/health.controller';
import { AuthHttpModule } from './modules/auth/auth.module';
import { UsersHttpModule } from './modules/users/users.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(10),
          limit: 10,
        },
      ],
    }),
    AuthHttpModule,
    UsersHttpModule,
    GameModule,
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
