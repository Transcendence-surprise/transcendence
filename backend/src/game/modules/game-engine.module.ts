import { Module } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';

@Module({
  providers: [EngineService],
  exports: [EngineService],
})
export class GameEngineModule {}
