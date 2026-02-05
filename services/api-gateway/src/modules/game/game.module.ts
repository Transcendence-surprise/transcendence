import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import gatewayConfig from '../../common/config/gateway.config';
import { GameController } from './game.controller';
import { GameHttpService } from './game.service';

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
  ],
  controllers: [GameController],
  providers: [GameHttpService],
  exports: [GameHttpService],
})
export class GameModule {}
