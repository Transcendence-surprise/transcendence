import { Module } from '@nestjs/common';
import { HttpClientsModule } from './http-clients/http-clients.module';
import { GatewayAuthController } from './controllers/gateway-auth.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [HttpClientsModule],
  controllers: [GatewayAuthController, HealthController],
  providers: [],
})
export class AppModule {}
