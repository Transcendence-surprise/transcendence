import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsIn,
  IsDateString,
  Min,
} from 'class-validator';
import { GamePhase, GameType } from '@transcendence/db-entities';

export class CreateMatchDto {
  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  type: GameType;

  @ApiProperty({ enum: GamePhase, required: false, default: GamePhase.LOBBY })
  @IsOptional()
  @IsEnum(GamePhase)
  phase?: GamePhase;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(0)
  numCollectables: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  numPlayers: number;

  @ApiProperty({ type: Number, enum: [1, 2] })
  @IsInt()
  @IsIn([1, 2])
  level: 1 | 2;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  boardSize: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @IsPositive()
  hostUserId: number;

  @ApiProperty({ type: Number, required: false, nullable: true })
  @IsOptional()
  @IsInt()
  winnerUserId?: number | null;

  @ApiProperty({ type: String, required: false, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiProperty({ type: String, required: false, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
