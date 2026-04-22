import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import gatewayConfig from '../../common/config/gateway.config';
import { ChatHttpService } from './chat.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [gatewayConfig.KEY],
      useFactory: (config: ConfigType<typeof gatewayConfig>) => ({
        baseURL: config.core.baseUrl,
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [ChatHttpService],
  exports: [ChatHttpService],
})
export class ChatHttpModule {}
