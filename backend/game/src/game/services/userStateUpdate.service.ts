// src/game/services/userStateUpdate.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@transcendence/db-entities';
import { Repository } from 'typeorm';
import { GameState } from '../models/state';

@Injectable()
export class UserUpdateService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  
  async updateUserStats(state: GameState, participantIds?: Array<number | string>) {
    const winnerId = state.gameResult?.winnerId;

    if (state.rules.mode === "SINGLE") return;

    const targetParticipantIds =
      participantIds && participantIds.length > 0
        ? participantIds
        : state.players.map((p) => p.id);

    await this.userRepo.manager.transaction(async (manager) => {
      for (const participantId of targetParticipantIds) {
        const userId = Number(participantId);

        if (isNaN(userId)) continue;

        await manager.increment(User, { id: userId }, 'totalGames', 1);

        if (participantId.toString() === winnerId) {
          await manager.increment(User, { id: userId }, 'totalWins', 1);
          await manager.increment(User, { id: userId }, 'winStreak', 1);
        } else {
          await manager.update(User, { id: userId }, { winStreak: 0 });
        }
      }
    });
  }
}
