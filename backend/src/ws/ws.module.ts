import { Module } from '@nestjs/common';
import { GameEngineModule } from '../game/modules/game-engine.module';
import { WsGateway } from './ws.gateway';

@Module({
  imports: [GameEngineModule],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}