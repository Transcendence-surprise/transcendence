import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { EngineService } from './services/engine.service.nest';

@Module({
  controllers: [GameController], // expose API endpoints
  providers: [EngineService],     // injectables used by controllers
  exports: [EngineService],       // optional, if another module needs it
})
export class GameModule {}
