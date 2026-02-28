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
} from 'class-validator';
import { StartError } from '../models/startResult';
import { JoinError } from '../models/joinResult';
// import type { BoardAction } from '../models/boardAction';
// import type { MoveAction } from '../models/moveAction';
import { LevelDto } from './level.dto';
import { LeaveError } from '../models/leaveResult';
import { PlayerStateDto } from './player-state.dto';
import { SpectatorDto } from './spectator.dto';
import { GameRulesDto } from './game-rules.dto';
import { BoardDto } from './board.dto';
import { BoardActionDto } from './board-action.dto';
import { PlayerProgressDto } from './player-progress.dto';
import { TurnActionsDto } from './turn-action.dto';
import { GameResultDto } from './game-result.dto';

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

// export class MoveDto {
//   @ApiProperty()
//   gameId: string;

//   @ApiProperty()
//   playerId: string;

//   @ApiProperty({ required: false, type: Object })
//   boardAction?: BoardAction;

//   @ApiProperty({ required: false, type: Object })
//   moveAction?: MoveAction;
// }

export class GameStateDto {
  @ApiProperty()
  levelId: string;

  @ApiProperty()
  level: LevelDto;

  @ApiProperty()
  phase: string;

  @ApiProperty({ required: false })
  hostId?: string;

  @ApiProperty({ type: [PlayerStateDto] })
  players: PlayerStateDto[];

  @ApiProperty({ type: [SpectatorDto] })
  spectators: SpectatorDto[];

  @ApiProperty({ type: GameRulesDto })
  rules: GameRulesDto;

  @ApiProperty({ type: BoardDto })
  board: BoardDto;

  @ApiProperty()
  currentPlayerIndex: number;

  @ApiProperty({ nullable: true })
  currentPlayerId: string | null;

  @ApiProperty({ type: BoardActionDto, required: false })
  lastBoardAction?: BoardActionDto;

  @ApiProperty({ type: TurnActionsDto })
  turnActions: TurnActionsDto;

  @ApiProperty({ type: Object })
  playerProgress: Record<string, PlayerProgressDto>;

  @ApiProperty()
  gameEnded: boolean;

  @ApiProperty()
  boardActionsPending: boolean;

  @ApiProperty({ type: Object })
  collected: Record<string, boolean>;

  @ApiProperty({ type: GameResultDto, required: false })
  gameResult?: GameResultDto;
}