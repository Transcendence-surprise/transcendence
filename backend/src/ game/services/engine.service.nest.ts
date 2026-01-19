import { Injectable } from '@nestjs/common';
import { GameState, GameSettings } from '../models/state';
// import { BoardAction } from '../models/boardAction';
// import { MoveAction } from '../models/moveAction';
// import { MoveResult } from '../models/moveResult';
// import { processTurn as processTurnFn } from '../engine/turn.engine';
import { createGame as  createGameEngine} from '../engine/create.engine';
import { joinGameEngine } from '../engine/join.engine';
import { startGameEngine } from "../engine/start.engine";
// import { leaveGameEngine } from "../engine/leave.engine";
// import { LeaveResult } from '../models/leaveResult';
import { listSinglePlayerLevels } from '../engine/levelRegistry.engine';
import { getMultiplayerGames } from '../engine/multiGames.engine';
import { SingleLevelInfo } from '../models/levelInfo';
import { MultiGame } from '../models/gameInfo';
import * as crypto from 'crypto';
import { getFakeMultiplayerGames } from './game.generator'; // REMOVE, Random test

@Injectable()
export class EngineService {
  private games = new Map<string, GameState>();



  createGame(hostId: string, settings: GameSettings) {
    const state = createGameEngine(hostId, settings); // from create.engine.ts
    const gameId = crypto.randomUUID();
    this.games.set(gameId, state);
    return { gameId };
  }

  getGameState(gameId: string): GameState {
    const state = this.games.get(gameId);
    if (!state) throw new Error('Game not found');
    return state;
  }

  startGame(gameId: string, hostId: string) {
    const state = this.getGameState(gameId);
    return startGameEngine(state, hostId);
  }

  joinGame(
    gameId: string,
    playerId: string,
    role: "PLAYER" | "SPECTATOR"
  ) {
    const state = this.getGameState(gameId);
    return joinGameEngine(state, playerId, role);
  }

//   processTurn(
//     state: GameState,
//     boardAction: BoardAction | null,
//     moveAction?: MoveAction
//   ): MoveResult {
//     return processTurnFn(state, boardAction, moveAction);
//   }

//   leaveGame(gameId: string, playerId: string): LeaveResult {
//     const state = this.getGameState(gameId);
//     return leaveGameEngine(state, playerId);
//   }

//   // Return all games currently in LOBBY phase
//   getLobbyGames(): { gameId: string; state: GameState }[] {
//     const result: { gameId: string; state: GameState }[] = [];
//     for (const [gameId, state] of this.games.entries()) {
//       if (state.phase === "LOBBY") {
//         result.push({ gameId, state });
//       }
//     }
//     return result;
//   }

  getSinglePlayerLevels(): SingleLevelInfo[] {
    return listSinglePlayerLevels();
  }

  getMultiGames(): MultiGame[] {
    return getMultiplayerGames(this.games);
  }
  getRandomGamesList() {
    return getFakeMultiplayerGames(10);
  }
}
