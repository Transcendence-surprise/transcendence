// src/game/models/privatState.ts

import { Board } from "./board";

export type LevelObjective =
  | { type: "COLLECT_ALL" }                       // single-player: all collectibles
  | { type: "COLLECT_N"; amount: number }         // multiplayer: assigned number
  | { type: "RETURN_HOME" }                       // both single & multi
  | { type: "REACH_EXIT" }; // optional for special special single-player objectives


export interface ObjectiveStatus {
  type: "COLLECT_ALL" | "COLLECT_N" | "RETURN_HOME" | "REACH_EXIT";
  done: boolean;
  progress?: number;
  amount?: number; // for COLLECT_N
}

export interface PlayerState {
  id: number | string;            // unique player identifier (number for users, string UUID for guests)
  slotId: string;                 // "P1"
  name: string;                   // nickname
  x: number;                      // current X position
  y: number;                      // current Y position
  hasMoved: boolean;              // did the player already move this turn?
  skipsLeft: number;              // how many skips the player has left
  totalMoves: number;             // total moves made (for move limit constraint)
  // stunned?: boolean;           // future-proof: player cannot act
}

export interface PlayerProgress {
  collectedItems: string[];       // items collected
  currentCollectibleId?: string;  // the next collectible to collect (multi only)
  objectives: ObjectiveStatus[];  // per-objective progress
}

export interface PrivateGameState {

  // -----------------------
  // Common / Public info
  // -----------------------
  levelId: string;                    // which level is being played
  level?: {
    constraints?: {
      maxMoves?: number;
      levelLimitSec?: number;
    };
  };                                  // optional level details for single-player constraints display
  hostName: string;                   // game owner nickname
  phase: "LOBBY" | "PLAY" | "END";
  board: Board;                        // board tiles, collected items
  players: PlayerState[];              // all players, with positions
  currentPlayerId: string | number;    // whose turn it is
  gameResult?: { winnerIds: string[] };// winners if game ended
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