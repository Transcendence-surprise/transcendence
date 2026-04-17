import { Injectable } from '@nestjs/common';
import { GamePhase } from '@transcendence/db-entities';
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
import { PlayerActionResult, PlayerActionError, PlayerAction } from '../models/playerAction';
import { processPlayerAction } from '../engine/playerAction.engine';
import { applySingleTimeout, applyMultiTimeout } from '../engine/timeout.engine';
import { GamePersistenceService } from './gamePersistence.service';
import { saveGameToDB } from '../engine/helpers/saveGameTo.database';
import { PlayersPersistenceService } from './playersPersistence.service';
import { savePlayersToDB } from '../engine/helpers/savePlayersTo.database';
import { UserUpdateService } from './userStateUpdate.service';

@Injectable()
export class EngineService {
  constructor(
    private readonly persistence: GamePersistenceService,
    private readonly playersPersistence: PlayersPersistenceService,
    private readonly userUpdateService: UserUpdateService,
  ) {}

  private games = new Map<string, GameState>();


  async evaluateSinglePlayerTimeouts(now = Date.now()) {
    const endedGames: Array<any> = [];
    const saves: Promise<void>[] = [];

    for (const [gameId, state] of this.games.entries()) {
      const ended = applySingleTimeout(state, now);
      if (!ended) continue;

      endedGames.push({
        gameId,
        playerIds: state.players.map(p => p.id),
        spectatorIds: state.spectators.map(s => s.id),
      });

      saves.push(saveGameToDB(gameId, state, this.persistence));
      saves.push(this.userUpdateService.updateUserStats(state));
    }

    await Promise.all(saves);

    return endedGames;
  }

  async evaluateMultiPlayerTimeouts(now = Date.now()) {
    const events: Array<any> = [];

    for (const [gameId, state] of this.games.entries()) {
      const result = applyMultiTimeout(state, now);

      if (!result) continue;

      if (result.type === 'PLAYER_REMOVED') {
        if (result.deleteGame) {
          this.games.delete(gameId);
        }

        if (!result.deleteGame) {
          await saveGameToDB(gameId, state, this.persistence);
        }

        events.push({
          type: 'PLAYER_REMOVED',
          gameId,
          removedPlayerIds: result.removedPlayerIds,
          playerIds: state.players.map(p => p.id),
          spectatorIds: state.spectators.map(s => s.id),
          deleteGame: result.deleteGame,
        });

        continue;
      }

      if (result.type === 'PLAY_UPDATE') {
        await saveGameToDB(gameId, state, this.persistence);

        events.push({ type: 'PLAY_UPDATE', gameId });
      }
    }

    return events;
  }

  async createGame(hostId: number | string, nickname:string, settings: GameSettings) {
    const state = createGameEngine(hostId, nickname, settings); // from create.engine.ts
    const gameId = crypto.randomUUID();
    this.games.set(gameId, state);
    await saveGameToDB(gameId, state, this.persistence);
    await savePlayersToDB(gameId, state, this.playersPersistence);
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

    const spectatorExists = state.spectators.some(
      s => s.id.toString() === playerId.toString()
    );

    if (!playerExists && !spectatorExists) {
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

  async joinGame(
    gameId: string,
    playerId: number | string,
    name: string,
    role: "PLAYER" | "SPECTATOR"
  ) {
    const state = this.getGameState(gameId);
    if (!state) {
      return { ok: false, error: JoinError.GAME_NOT_FOUND };
    }
    const result = joinGameEngine(state, playerId, name, role);
    if (result.ok && role === 'PLAYER') {
      await savePlayersToDB(gameId, state, this.playersPersistence);
    }
    return result;
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
    if (state.rules.mode === "MULTI" &&
        state.currentPlayerId.toString() !== playerId.toString()) {
      return { ok: false, error: BoardActionError.NOT_YOUR_TURN };
    }

    if (state.phase !== "PLAY") {
      return { ok: false, error: BoardActionError.INVALID_ACTION };
    }
    if (state.rules.mode === "MULTI" && state.boardActionsPending === false) {
      return { ok: false, error: BoardActionError.BOARD_ACTION_ALREADY_PERFORMED };
    }

    return processBoardAction(state, boardAction);
  }

  async playerAction(
      gameId: string,
      action: PlayerAction,
      playerId: number | string,
    ):  Promise<PlayerActionResult> {
      const state = this.getGameState(gameId);
    if (!state) {
      return { ok: false, error: PlayerActionError.GAME_NOT_FOUND };
    }
    // Check player exists
    const playerExists = state.players.some(
      p => p.id.toString() === playerId.toString()
    );

    if (!playerExists) {
      return { ok: false, error: PlayerActionError.PLAYER_NOT_FOUND };
    }

    // Check turn
    if (state.rules.mode === "MULTI" &&
        state.currentPlayerId.toString() !== playerId.toString()) {
      return { ok: false, error: PlayerActionError.NOT_YOUR_TURN };
    }

    if (state.phase !== "PLAY") {
      return { ok: false, error: PlayerActionError.INVALID_ACTION };
    }
    if (state.rules.mode === "MULTI" && state.boardActionsPending === true) {
      return { ok: false, error: PlayerActionError.REQUIRED_BOARD_ACTION };
    }

    const result = processPlayerAction(state, action);

    await saveGameToDB(gameId, state, this.persistence);

    if (result.ok && state.gameEnded) {
      await this.userUpdateService.updateUserStats(state);
    }

    return result;
  }

  async leaveGame(gameId: string, playerId: number | string): Promise<LeaveResult> {
    const state = this.getGameState(gameId);

    if (!state) {
      return { ok: false, error: LeaveError.GAME_NOT_FOUND };
    }
    // Capture previous players and spectators BEFORE mutation
    const previousPlayers = state.players.map(p => p.id);
    const previousSpectators = state.spectators.map(s => s.id);

    const result = leaveGameEngine(state, playerId);
    if (!result.ok) return result;

    if (state.phase === GamePhase.LOBBY && !result.deleteGame && state.hostId !== playerId) {
      await this.playersPersistence.deletePlayer(gameId, playerId);
    }

    if (result.deleteGame) {
      state.gameEnded = true;
      state.phase = GamePhase.END;
      state.completionStatus = 'ABANDONED';
      state.gameResult = undefined;
      state.endReason = undefined;
      await saveGameToDB(gameId, state, this.persistence);
      this.games.delete(gameId);
      // console.log(`Game ${gameId} deleted after player left ${playerId}`);
      return { ok: true, deleteGame: true, previousPlayers, previousSpectators };
    }
    // console.log(`Player ${playerId} left game ${gameId}`);
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
        if (state.phase === "END") {
          continue;
        }

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
