//src/game/services/game-timeout.service.ts

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EngineService } from './engine.service.nest';

@Injectable()
export class GameTimeoutService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameTimeoutService.name);
  private ticker?: NodeJS.Timeout;

  constructor(private readonly engine: EngineService) {}

  onModuleInit(): void {
    this.ticker = setInterval(async () => {
      try {
        await this.engine.evaluateSinglePlayerTimeouts();
        await this.engine.evaluateMultiPlayerTimeouts();
      } catch (error) {
        this.logger.error(
          `Error in game timeout ticker: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }, 1000);
  }

  onModuleDestroy(): void {
    if (this.ticker) {
      clearInterval(this.ticker);
    }
  }
}
