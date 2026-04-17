// src/game/services/gamePersistence.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameType } from '@transcendence/db-entities';
import { GameState } from '../models/state';

@Injectable()
export class GamePersistenceService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  async saveGame(gameId: string, state: GameState) {
    await this.gameRepo.save({
      id: gameId,
      type: state.rules.mode as GameType,
      hostUserId: state.hostId.toString(),
      state: state as any,
      phase: state.phase,
      winnerUserId: state.gameResult?.winnerId ?? null,
      completionStatus: (
        state.completionStatus === 'ABANDONED'
          ? 'ABANDONED'
          : 'FINISHED'
      ) as any,
      endedAt: state.phase === 'END' ? new Date() : null,
    });
    console.log(`Game ${gameId} saved with phase ${state.phase} and completion status ${state.completionStatus}!!!`);
  }
}