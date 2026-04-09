// src/game/entities/game-player.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';

@Entity({ name: 'game_players' })
@Index('game_players_game_user_unique', ['gameId', 'userId'], { unique: true })
export class GamePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  gameId: string;

  @ManyToOne(() => Game, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'enum', enum: ['PLAYER', 'SPECTATOR'] })
  role: 'PLAYER' | 'SPECTATOR';

  @Column({ type: 'enum', enum: ['USER', 'GUEST', 'ADMIN'] })
  userType: 'USER' | 'GUEST' | 'ADMIN';

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;
}
