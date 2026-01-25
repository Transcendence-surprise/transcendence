import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { AuthHttpModule } from './modules/auth/auth-http.module';
import { UsersHttpModule } from './modules/users/users-http.module';

@Module({
  imports: [AuthHttpModule, UsersHttpModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
