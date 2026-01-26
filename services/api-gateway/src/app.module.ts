import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { AuthHttpModule } from './modules/auth/auth.module';
import { UsersHttpModule } from './modules/users/users.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [AuthHttpModule, UsersHttpModule, GameModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
