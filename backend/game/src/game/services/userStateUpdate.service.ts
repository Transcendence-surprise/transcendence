// src/game/services/userStateUpdate.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'db-entities-dist';
import { Repository } from 'typeorm';
import { GameState } from '../models/state';

@Injectable()
export class UserUpdateService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  
  async updateUserStats(state: GameState) {
    const winnerId = state.gameResult?.winnerId;

    if (state.rules.mode === "SINGLE") return;
    await this.userRepo.manager.transaction(async (manager) => {
      for (const p of state.players) {

        const userId = Number(p.id);

        if (isNaN(userId)) continue;

        await manager.increment(User, { id: userId }, 'totalGames', 1);

        if (p.id.toString() === winnerId) {
          await manager.increment(User, { id: userId }, 'totalWins', 1);
          await manager.increment(User, { id: userId }, 'winStreak', 1);
        } else {
          await manager.update(User, { id: userId }, { winStreak: 0 });
        }
      }
    });
  }
}
