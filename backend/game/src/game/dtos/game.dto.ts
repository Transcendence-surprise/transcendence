// dtos/game.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsIn,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { StartError } from '../models/startResult';
import { JoinError } from '../models/joinResult';
import { LeaveError } from '../models/leaveResult';
import type { BoardAction } from '../models/boardAction';
import { BoardActionError } from '../models/boardAction';
import type { Board } from '../models/board';
import type { PlayerProgress } from '../models/state';
import { PlayerStateDto } from './playerState.dto';
import type { PlayerAction } from '../models/playerAction';
import { PlayerActionError } from '../models/playerAction';
import { Type } from 'class-transformer';

export enum PlayerRole {
  PLAYER = 'PLAYER',
  SPECTATOR = 'SPECTATOR',
}

export class CreateGameDto {
  @ApiProperty({ enum: ['SINGLE', 'MULTI'] })
  @IsEnum(['SINGLE', 'MULTI'])
  mode: 'SINGLE' | 'MULTI';

  // SINGLE
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  levelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowSpectators?: boolean;

  // MULTI
  @ApiPropertyOptional({ enum: [2, 3, 4] })
  @IsOptional()
  @IsIn([2, 3, 4])
  maxPlayers?: 2 | 3 | 4;

  @ApiPropertyOptional({ enum: [6, 7, 8, 9] })
  @IsOptional()
  @IsIn([6, 7, 8, 9])
  boardSize?: 6 | 7 | 8 | 9;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  collectiblesPerPlayer?: number;
}

export class CreateGameResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty()
  gameId: string;
}

export class StartGameDto {
  @ApiProperty()
  @IsString()
  gameId: string;
}

export class StartResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional({ enum: StartError })
  error?: StartError;
}

export class JoinGameDto {
  @ApiProperty()
  @IsUUID()
  gameId: string;

  @ApiProperty({ enum: PlayerRole })
  @IsEnum(PlayerRole)
  role: PlayerRole;
}

export class JoinResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional({ enum: JoinError })
  error?: JoinError;
}

export class BoardResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional()
  action?: BoardAction;

  @ApiPropertyOptional({ enum: BoardActionError })
  error?: BoardActionError;
}

class PointDto {
  @ApiProperty()
  @IsNumber()
  x!: number;

  @ApiProperty()
  @IsNumber()
  y!: number;
}

export class PlayerMoveDto {
  @ApiProperty()
  @IsUUID()
  gameId!: string;

  @ApiProperty({ type: [PointDto] })
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  path!: PointDto[];
}

export class PlayerActionResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional()
  action?: PlayerAction;

  @ApiPropertyOptional({ enum: PlayerActionError })
  error?: PlayerActionError;
}

export class LeaveGameDto {
  @ApiProperty({ description: 'ID of the game to leave' })
  @IsUUID()
  gameId: string;
}

export class LeaveResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional({ enum: LeaveError })
  error?: LeaveError;
}

export class PrivateGameStateDto {
  // -----------------------
  // Common / Public info
  // -----------------------
  @ApiProperty()
  levelId: string;

  @ApiProperty()
  hostName: string;

  @ApiProperty({ enum: ['LOBBY', 'PLAY', 'END'] })
  phase: 'LOBBY' | 'PLAY' | 'END';

  @ApiProperty()
  board: Board;

  @ApiProperty({ type: [PlayerStateDto] })
  players: PlayerStateDto[];

  @ApiProperty()
  currentPlayerId: string | number;

  @ApiPropertyOptional()
  gameResult?: { winnerIds: string[] };

  @ApiProperty({ type: [String], description: 'Who is watching' })
  spectators: string[];

  @ApiProperty({ type: [String] })
  objectives: string[];

  @ApiPropertyOptional()
  gameStartedAt?: number;

  @ApiPropertyOptional()
  moveStartedAt?: number;

  // -----------------------
  // Personal / Private info
  // -----------------------
  @ApiProperty()
  boardActionsPending: boolean;

  @ApiProperty()
  playerProgress: PlayerProgress;

  @ApiProperty()
  skipsLeft: number;
}

export class GameStateResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional()
  state?: PrivateGameStateDto;

  @ApiPropertyOptional()
  error?: string;
}