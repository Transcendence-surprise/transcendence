import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import gatewayConfig from '../../common/config/gateway.config';
import { GameController } from './game.controller';
import { GameHttpService } from './game.service';
import { AuthHttpModule } from '../auth/auth.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { GameGateway } from '../realtime/game.gateway';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [gatewayConfig.KEY],
      useFactory: (config: ConfigType<typeof gatewayConfig>) => ({
        baseURL: config.game.baseUrl,
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    AuthHttpModule,
    RealtimeModule,
  ],
  controllers: [GameController],
  providers: [GameHttpService, GameGateway],
  exports: [GameHttpService],
})
export class GameModule {}
