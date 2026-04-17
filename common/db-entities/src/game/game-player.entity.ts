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
import { User } from '../users/user.entity';

export enum PlayerRole {
  PLAYER = 'PLAYER',
  SPECTATOR = 'SPECTATOR',
}

export enum UserType {
  USER = 'USER',
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'game_players' })
@Index('game_players_game_user_unique', ['gameId', 'userId'], { unique: true })
export class GamePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id', type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Game, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  // This stores both registered users (as string) and guest UUIDs
  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  // Only for registered users: FK to users table
  @Column({ name: 'registered_user_id', type: 'int', nullable: true })
  registeredUserId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'registered_user_id' })
  registeredUser: User;

  @Column({ type: 'enum', enum: PlayerRole, enumName: 'player_role' })
  role: PlayerRole;

  @Column({ name: 'user_type', type: 'enum', enum: UserType, enumName: 'user_type' })
  userType: UserType;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;
}
