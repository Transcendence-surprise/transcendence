import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import gatewayConfig from '../../common/config/gateway.config';
import { UsersHttpService } from './users.service';
import { UsersController } from './users.controller';
import { AuthHttpModule } from '../auth/auth.module';

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
  ],
  controllers: [UsersController],
  providers: [UsersHttpService],
  exports: [UsersHttpService],
})
export class UsersHttpModule {}
