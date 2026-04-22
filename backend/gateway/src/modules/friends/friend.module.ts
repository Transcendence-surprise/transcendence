import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import gatewayConfig from '../../common/config/gateway.config';
import { AuthHttpModule } from '../auth/auth.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { FriendController } from './friend.controller';
import { FriendHttpService } from './friend.service';

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
	controllers: [FriendController],
	providers: [FriendHttpService],
	exports: [FriendHttpService],
})
export class FriendHttpModule {}
