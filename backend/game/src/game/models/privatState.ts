// src/game/models/privateState.ts

import { Board } from "./board";
import { Level } from "./level";
import { PlayerProgress, PlayerState } from "./state";

export interface PrivateGameState {

  // -----------------------
  // Common / Public info
  // -----------------------

  levelId: string;                    // which level is being played
  level: Level;                       // level details (optional, for display)
  hostName: string;                   // game owner nickname
  phase: "LOBBY" | "PLAY" | "END";
  board: Board;                        // board tiles, collected items
  players: PlayerState[];              // all players, with positions
  currentPlayerId: string | number;    // whose turn it is
  gameResult?: { winnerIds: string[] };// winners if game ended
  endReason?: "WIN" | "LOSE_MAX_MOVES" | "LOSE_TIME_LIMIT";
  completionStatus?: "FINISHED" | "ABANDONED";
  spectators: string[];                // who is watching
  objectives: string[];                // for display: what to achieve
  gameStartedAt?: number;              // timestamp when game started (for total timer)
  moveStartedAt?: number;              // timestamp when current player's turn started (for move timer)
  moveLimitPerTurnSec?: number;        // move time limit in seconds (optional, for timer display)

  // -----------------------
  // Personal / Private info
  // -----------------------
  boardActionsPending: boolean;        // if current player still needs to do board action
  playerProgress: PlayerProgress;      // collected items, next collectible, objectives
  skipsLeft: number;                   // how many skips the current player has left
}  

export interface PrivateGameStateResult {
  ok: boolean;
  state?: PrivateGameState;
  error?: string;
}

export enum PrivateStateError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND",
}