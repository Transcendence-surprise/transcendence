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

@Entity({ name: 'games' })
@Index('games_phase_idx', ['phase'])
@Index('games_type_idx', ['type'])
@Index('games_host_user_idx', ['hostUserId'])
@Index('games_ended_at_idx', ['endedAt'])
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: GameType, enumName: 'game_type' })
  type: GameType;

  @Column({ name: 'num_collectables', type: 'int' })
  numCollectables: number;

  @Column({ name: 'num_players', type: 'int' })
  numPlayers: number;

  @Column({ type: 'smallint' })
  level: 1 | 2;

  @Column({ type: 'enum', enum: GamePhase, enumName: 'game_phase' })
  phase: GamePhase;

  @Column({ name: 'board_size', type: 'int' })
  boardSize: number;

  @Column({ name: 'host_user_id', type: 'int' })
  hostUserId: number;

  @Column({ name: 'winner_user_id', type: 'int', nullable: true })
  winnerUserId: number | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
