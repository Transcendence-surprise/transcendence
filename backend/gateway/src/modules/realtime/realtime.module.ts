import { Module } from '@nestjs/common';
import { AuthHttpModule } from '../auth/auth.module';
import { BadgeModule } from '../badges/badge.module';
import { RealtimeGateway } from './realtime.gateway';
import { PresenceModule } from '../presence/presence.module';
import { FriendsGateway } from './friends.gateway';
import { ChatGateway } from './chat.gateway';
import { GameGateway } from './game.gateway';

@Module({
  imports: [
    AuthHttpModule,
    PresenceModule,
    BadgeModule,

  ],
  providers: [RealtimeGateway, FriendsGateway, ChatGateway, GameGateway],
  exports: [RealtimeGateway, FriendsGateway, ChatGateway, GameGateway],
})
export class RealtimeModule {}