/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BoardActionDto } from './BoardActionDto';
import type { BoardDto } from './BoardDto';
import type { GameResultDto } from './GameResultDto';
import type { GameRulesDto } from './GameRulesDto';
import type { LevelDto } from './LevelDto';
import type { PlayerStateDto } from './PlayerStateDto';
import type { SpectatorDto } from './SpectatorDto';
import type { TurnActionsDto } from './TurnActionsDto';
export type GameStateDto = {
    levelId: string;
    level: LevelDto;
    phase: string;
    hostId?: string;
    players: Array<PlayerStateDto>;
    spectators: Array<SpectatorDto>;
    rules: GameRulesDto;
    board: BoardDto;
    currentPlayerIndex: number;
    currentPlayerId: Record<string, any> | null;
    lastBoardAction?: BoardActionDto;
    turnActions: TurnActionsDto;
    playerProgress: Record<string, any>;
    gameEnded: boolean;
    boardActionsPending: boolean;
    collected: Record<string, any>;
    gameResult?: GameResultDto;
};

