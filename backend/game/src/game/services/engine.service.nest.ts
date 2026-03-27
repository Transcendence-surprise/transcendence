import { Injectable } from '@nestjs/common';
import { GameState, GameSettings } from '../models/state';
import { PlayerCheckResult } from '../models/payerCheckResult';
import { createGame as  createGameEngine} from '../engine/create.engine';
import { joinGameEngine } from '../engine/join.engine';
import { startGameEngine } from "../engine/start.engine";
import { leaveGameEngine } from "../engine/leave.engine";
import { LeaveResult } from '../models/leaveResult';
import { StartError } from '../models/startResult';
import { JoinError } from '../models/joinResult';
import { LeaveError } from '../models/leaveResult';
import { listSinglePlayerLevels } from '../engine/levelRegistry.engine';
import { getMultiplayerGames } from '../engine/multiGames.engine';
import { SingleLevelInfo } from '../models/levelInfo';
import { MultiGame } from '../models/gameInfo';
import { processBoardAction } from '../engine/boardAction.engine';
import { BoardAction, BoardActionResult, BoardActionError } from '../models/boardAction';
import * as crypto from 'crypto';
import { PrivateGameStateResult, PrivateStateError } from '../models/privatState';
import { getPrivateState } from '../engine/privateState.engine';

@Injectable()
export class EngineService {
  private games = new Map<string, GameState>();

  createGame(hostId: number | string, nickname:string, settings: GameSettings) {
    const state = createGameEngine(hostId, nickname, settings); // from create.engine.ts
    const gameId = crypto.randomUUID();
    this.games.set(gameId, state);
    return { gameId };
  }

  getGameState(gameId: string): GameState | null {
    const state = this.games.get(gameId);
    return state ?? null;
  }

  getPrivateGameState(gameId: string, playerId: number | string): PrivateGameStateResult {
    const state = this.games.get(gameId);

    if (!state) {
      return { ok: false, error: PrivateStateError.GAME_NOT_FOUND };
    }

    const playerExists = state.players.some(
      p => p.id.toString() === playerId.toString()
    );

    if (!playerExists) {
      return { ok: false, error: PrivateStateError.PLAYER_NOT_FOUND };
    }

    return getPrivateState(state, playerId);
  }

  startGame(gameId: string, hostId: number | string) {
    try {
      const state = this.getGameState(gameId);

      if (!state) {
        return { ok: false, error: StartError.GAME_NOT_FOUND };
      }

      return startGameEngine(state, hostId);
    } catch {
      return { ok: false, error: StartError.GAME_NOT_FOUND };
    }
  }

  joinGame(
    gameId: string,
    playerId: number | string,
    name: string,
    role: "PLAYER" | "SPECTATOR"
  ) {
    const state = this.getGameState(gameId);
    if (!state) {
      return { ok: false, error: JoinError.GAME_NOT_FOUND };
    }
    return joinGameEngine(state, playerId, name, role);
  }

  boardModification(
    gameId: string,
    boardAction: BoardAction,
    playerId: number | string,
  ): BoardActionResult {
      const state = this.getGameState(gameId);
    if (!state) {
      return { ok: false, error: BoardActionError.GAME_NOT_FOUND };
    }
    // Check player exists
    const playerExists = state.players.some(
      p => p.id.toString() === playerId.toString()
    );

    if (!playerExists) {
      return { ok: false, error: BoardActionError.PLAYER_NOT_FOUND };
    }

    // Check turn
    if (state.currentPlayerId.toString() !== playerId.toString()) {
      return { ok: false, error: BoardActionError.NOT_YOUR_TURN };
    }
    if (state.phase !== "PLAY") {
      return { ok: false, error: BoardActionError.INVALID_ACTION };
    }
    if (state.boardActionsPending === false) {
      return { ok: false, error: BoardActionError.BOARD_ACTION_ALREADY_PERFORMED };
    }
    return processBoardAction(state, boardAction);
  }

  leaveGame(gameId: string, playerId: number | string): LeaveResult {
    const state = this.getGameState(gameId);

    if (!state) {
      return { ok: false, error: LeaveError.GAME_NOT_FOUND };
    }
    // Capture previous players and spectators BEFORE mutation
    const previousPlayers = state.players.map(p => p.id);
    const previousSpectators = state.spectators.map(s => s.id);

    const result = leaveGameEngine(state, playerId);
    if (!result.ok) return result;

    if (result.deleteGame) {
      this.games.delete(gameId);
      console.log(`Game ${gameId} deleted after player left ${playerId}`);
      return { ok: true, deleteGame: true, previousPlayers, previousSpectators };
    }
    console.log(`Player ${playerId} left game ${gameId}`);
    return { ok: true, previousPlayers, previousSpectators };
  }

  getSinglePlayerLevels(): SingleLevelInfo[] {
    return listSinglePlayerLevels();
  }

  getMultiGames(): MultiGame[] {
    return getMultiplayerGames(this.games);
  }

  checkPlayerAvailability(playerId: number | string): PlayerCheckResult {
    const pid = playerId.toString();

    for (const [gameId, state] of this.games.entries()) {
      const isPlayer = state.players.some(p => p.id.toString() === pid);
      const isSpectator = state.spectators.some(s => s.id.toString() === pid);

      if (isPlayer || isSpectator) {
        return {
          ok: false,
          gameId,
          phase: state.phase,
        };
      }
    }
    return { ok: true };
  }
}
