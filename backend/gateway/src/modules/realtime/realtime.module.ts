import { Global, Module } from '@nestjs/common';
import { AuthHttpModule } from '../auth/auth.module';
import { BadgeModule } from '../badges/badge.module';
import { ChatHttpModule } from '../chat/chat.module';
import { GameModule } from '../game/game.module';
import { RealtimeGateway } from './realtime.gateway';
import { PresenceModule } from '../presence/presence.module';
import { FriendsGateway } from './friends.gateway';

@Module({
  imports: [
    AuthHttpModule,
    PresenceModule,
    ChatHttpModule,
    GameModule,
    BadgeModule,
  ],
  providers: [RealtimeGateway, FriendsGateway],
  exports: [RealtimeGateway, FriendsGateway],
})
export class RealtimeModule {}