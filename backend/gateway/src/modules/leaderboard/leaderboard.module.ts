import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import gatewayConfig from '../../common/config/gateway.config';
import { LeaderboardHttpService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
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
  controllers: [LeaderboardController],
  providers: [LeaderboardHttpService],
  exports: [LeaderboardHttpService],
})
export class LeaderboardModule {}
