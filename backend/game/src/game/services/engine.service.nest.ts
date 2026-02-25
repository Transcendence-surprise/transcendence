import { Injectable } from '@nestjs/common';
import { GameState, GameSettings } from '../models/state';
// import { BoardAction } from '../models/boardAction';
// import { MoveAction } from '../models/moveAction';
// import { MoveResult } from '../models/moveResult';
import { PlayerCheckResult } from '../models/payerCheckResult';
// import { processTurn as processTurnFn } from '../engine/turn.engine';
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
import * as crypto from 'crypto';

@Injectable()
export class EngineService {
  private games = new Map<string, GameState>();

  createGame(hostId: number, nickname:string, settings: GameSettings) {
    const state = createGameEngine(hostId, nickname, settings); // from create.engine.ts
    const gameId = crypto.randomUUID();
    this.games.set(gameId, state);
    return { gameId };
  }

  getGameState(gameId: string): GameState {
    const state = this.games.get(gameId);
    if (!state) throw new Error('Game not found');
    return state;
  }

  startGame(gameId: string, hostId: number) {
    try {
      const state = this.getGameState(gameId);
      return startGameEngine(state, hostId);
    } catch (err) {
      return { ok: false, error: StartError.GAME_NOT_FOUND };
    }
  }

  joinGame(
    gameId: string,
    playerId: number,
    name: string,
    role: "PLAYER" | "SPECTATOR"
  ) {
    const state = this.getGameState(gameId);
    if (!state) {
      return { ok: false, error: JoinError.GAME_NOT_FOUND };
    }
    return joinGameEngine(state, playerId, name, role);
  }

//   processTurn(
//     state: GameState,
//     boardAction: BoardAction | null,
//     moveAction?: MoveAction
//   ): MoveResult {
//     return processTurnFn(state, boardAction, moveAction);
//   }

  leaveGame(gameId: string, playerId: number): LeaveResult {
    const state = this.getGameState(gameId);
    const result = leaveGameEngine(state, playerId);
    if (!result.ok) return result;

    if (result.deleteGame) {
      this.games.delete(gameId);
      return { ok: true, deleteGame: true };
    }
    return { ok: true };
  }

  getSinglePlayerLevels(): SingleLevelInfo[] {
    return listSinglePlayerLevels();
  }

  getMultiGames(): MultiGame[] {
    return getMultiplayerGames(this.games);
  }

  checkPlayerAvailability(playerId: number): PlayerCheckResult {
    for (const [gameId, state] of this.games.entries()) {
      const isPlayer = state.players.some(p => p.id === playerId);
      const isSpectator = state.spectators.some(s => s.id === playerId);

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
