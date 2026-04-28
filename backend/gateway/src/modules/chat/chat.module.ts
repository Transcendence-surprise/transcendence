// src/modules/chat/chat.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import gatewayConfig from '../../common/config/gateway.config';
import { ChatHttpService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthHttpModule } from '../auth/auth.module';
import { RealtimeModule } from '../realtime/realtime.module';

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
    AuthHttpModule,
    RealtimeModule,
  ],
  controllers: [ChatController],
  providers: [ChatHttpService],
  exports: [ChatHttpService],
})
export class ChatHttpModule {}