// src/game/services/playersPersistence.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePlayer } from '@transcendence/db-entities';
import { PlayerRole, UserType } from '@transcendence/db-entities/game/game-player.entity';
import { GameState } from '../models/state';

@Injectable()
export class PlayersPersistenceService {
  constructor(
    @InjectRepository(GamePlayer) private readonly playerRepo: Repository<GamePlayer>,
  ) {}

  async savePlayer(gameId: string, state: GameState) {
    for (const p of state.players) {
      const isRegisteredUser = typeof p.id === 'number' && Number.isFinite(p.id);
      const registeredUserId: number | null = isRegisteredUser && typeof p.id === 'number' ? p.id : null;

      await this.playerRepo.upsert({
        gameId,
        userId: p.id.toString(),
        registeredUserId,
        role: PlayerRole.PLAYER,
        userType: isRegisteredUser ? UserType.USER : UserType.GUEST,
      }, ['gameId', 'userId']);
    }
  }

  async deletePlayer(gameId: string, playerId: string | number) {
    await this.playerRepo.delete({
      gameId,
      userId: playerId.toString(),
    });
  }
}
