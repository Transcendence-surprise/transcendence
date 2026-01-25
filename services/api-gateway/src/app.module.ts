import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { AuthHttpModule } from './modules/auth/auth.module';
import { UsersHttpModule } from './modules/users/users.module';

@Module({
  imports: [AuthHttpModule, UsersHttpModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
