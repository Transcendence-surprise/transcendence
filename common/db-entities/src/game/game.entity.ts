// src/game/entities/game.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GameType {
  SINGLE = 'SINGLE',
  MULTI = 'MULTI',
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  PLAY = 'PLAY',
  END = 'END',
}

export enum GameCompletionStatus {
  FINISHED = 'FINISHED',
  ABANDONED = 'ABANDONED',
}

@Entity({ name: 'games' })
@Index('games_phase_idx', ['phase'])
@Index('games_type_idx', ['type'])
@Index('games_host_user_idx', ['hostUserId'])
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ type: 'enum', enum: GameType, enumName: 'game_type' })
  type: GameType;

  @Column({ type: 'enum', enum: GamePhase, enumName: 'game_phase' })
  phase: GamePhase;

  @Column({ name: 'host_user_id', type: 'varchar' })
  hostUserId: string;

  @Column({ type: 'jsonb' })
  state: Record<string, any>; // GameState; //Safer, but need to be defined

  @Column({ name: 'winner_user_id', type: 'varchar', nullable: true })
  winnerUserId: string | null;

  @Column({
    name: 'completion_status',
    type: 'enum',
    enum: GameCompletionStatus,
    enumName: 'game_completion_status',
    default: GameCompletionStatus.FINISHED,
  })
  completionStatus: GameCompletionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
