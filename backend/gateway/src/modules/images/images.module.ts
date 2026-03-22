import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import { ImagesHttpService } from './images.service';
import { ImagesController } from './images.controller';
import gatewayConfig from '../../common/config/gateway.config';

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
  controllers: [ImagesController],
  providers: [ImagesHttpService],
  exports: [ImagesHttpService],
})
export class ImagesHttpModule {}
