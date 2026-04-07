import { ApiProperty } from '@nestjs/swagger';
import { GamePhase, GameType } from '@transcendence/db-entities';

export class MatchDto {
  @ApiProperty({ type: Number, description: 'Game ID' })
  id: number;

  @ApiProperty({ enum: GameType })
  type: GameType;

  @ApiProperty({ enum: GamePhase })
  phase: GamePhase;

  @ApiProperty({ type: Number })
  numCollectables: number;

  @ApiProperty({ type: Number })
  numPlayers: number;

  @ApiProperty({ type: Number, description: 'Level (1 or 2)' })
  level: 1 | 2;

  @ApiProperty({ type: Number })
  boardSize: number;

  @ApiProperty({ type: Number })
  hostUserId: number;

  @ApiProperty({ type: Number, required: false, nullable: true })
  winnerUserId?: number | null;

  @ApiProperty({ type: String, format: 'date-time', required: false, nullable: true })
  startedAt?: Date | null;

  @ApiProperty({ type: String, format: 'date-time', required: false, nullable: true })
  endedAt?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
