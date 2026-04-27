import { Module } from '@nestjs/common';
import { AuthHttpModule } from '../auth/auth.module';
import { BadgeModule } from '../badges/badge.module';
import { GameModule } from '../game/game.module';
import { RealtimeGateway } from './realtime.gateway';
import { PresenceModule } from '../presence/presence.module';
import { FriendsGateway } from './friends.gateway';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    AuthHttpModule,
    PresenceModule,
    GameModule,
    BadgeModule,

  ],
  providers: [RealtimeGateway, FriendsGateway, ChatGateway],
  exports: [RealtimeGateway, FriendsGateway],
})
export class RealtimeModule {}