import { ApiProperty } from '@nestjs/swagger';
import { GamePhase, GameType } from '@transcendence/db-entities';

export class MatchDto {
  @ApiProperty({ type: String, description: 'Game ID' })
  id: string;

  @ApiProperty({ enum: GameType })
  type: GameType;

  @ApiProperty({ enum: GamePhase })
  phase: GamePhase;

  @ApiProperty({ type: String })
  hostUserId: string;

  @ApiProperty({ type: String, format: 'date-time', required: false, nullable: true })
  winnerUserId?: string | null;

  @ApiProperty({ type: Object })
  state: Record<string, any>;

  @ApiProperty({ type: String, format: 'date-time', required: false, nullable: true })
  endedAt?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
