import { Module } from '@nestjs/common';
import { GameEngineModule } from '../game/modules/game-engine.module';
import { WsGateway } from './ws.gateway';
import { ChatService } from '../chat/chat.service';

@Module({
  imports: [GameEngineModule],
  providers: [WsGateway, ChatService],
  exports: [WsGateway],
})
export class WsModule {}