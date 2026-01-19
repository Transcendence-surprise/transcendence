// dtos/game.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import type { GameSettings, GameState } from '../models/state';
import type { BoardAction } from '../models/boardAction';
// import type { MoveAction } from '../models/moveAction';
import { LevelDto } from './level.dto';
import { PlayerStateDto } from './player-state.dto';
import { SpectatorDto } from './spectator.dto';
import { GameRulesDto } from './game-rules.dto';
import { BoardDto } from './board.dto';
import { BoardActionDto } from './board-action-dto';
import { PlayerProgressDto } from './player-progress.dto';
import { TurnActionsDto } from './turn-action.dto';
import { GameResultDto } from './game-result.dto';

export class CreateGameDto {
  @ApiProperty()
  hostId: string;

  @ApiProperty({ type: Object }) // could create separate GameSettingsDto if you want
  settings: GameSettings;
}

// export class StartGameDto {
//   @ApiProperty()
//   gameId: string;

//   @ApiProperty()
//   hostId: string;
// }

// export class JoinGameDto {
//   @ApiProperty()
//   gameId: string;

//   @ApiProperty()
//   playerId: string;

//   @ApiProperty({ enum: ['PLAYER', 'SPECTATOR'] })
//   role: 'PLAYER' | 'SPECTATOR';
// }

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

// export class LeaveGameDto {
//   @ApiProperty()
//   gameId: string;

//   @ApiProperty()
//   playerId: string;
// }

// export class LobbyGamesResponseDto {
//   gameId: string;
//   state: GameState;
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