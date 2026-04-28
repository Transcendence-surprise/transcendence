import { Module } from '@nestjs/common';
import { AuthHttpModule } from '../auth/auth.module';
import { RealtimeGateway } from './realtime.gateway';
import { PresenceModule } from '../presence/presence.module';

@Module({
  imports: [
    AuthHttpModule,
    PresenceModule,
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {} 