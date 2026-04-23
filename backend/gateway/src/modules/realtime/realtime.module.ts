import { Global, Module } from '@nestjs/common';
import { AuthHttpModule } from '../auth/auth.module';
import { BadgeModule } from '../badges/badge.module';
import { ChatHttpModule } from '../chat/chat.module';
import { GameModule } from '../game/game.module';
import { RealtimeGateway } from './realtime.gateway';

@Global()
@Module({
  imports: [AuthHttpModule, ChatHttpModule, GameModule, BadgeModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
