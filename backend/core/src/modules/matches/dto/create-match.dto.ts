import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsObject,
  IsString,
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

  @ApiProperty({ type: String })
  @IsString()
  hostUserId: string;

  @ApiProperty({ type: Object })
  @IsObject()
  state: Record<string, any>;

  @ApiProperty({ type: String, required: false, nullable: true })
  @IsOptional()
  @IsString()
  winnerUserId?: string | null;

  @ApiProperty({ type: String, required: false, format: 'date-time' })
  @IsOptional()
  endedAt?: string;
}
