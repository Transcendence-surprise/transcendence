import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ConfigType } from '@nestjs/config';
import gatewayConfig from '../../common/config/gateway.config';
import { PresenceHTTPService } from './presence.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [gatewayConfig.KEY],
      useFactory: (config: ConfigType<typeof gatewayConfig>) => ({
        baseURL: config.core.baseUrl,
      }),
    }),
  ],
  providers: [PresenceHTTPService],
  exports: [PresenceHTTPService],
})
export class PresenceModule {}