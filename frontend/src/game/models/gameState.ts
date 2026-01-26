// src/game/models/GameStateDto.ts

import { Board } from "./board";

export type GamePhase = "LOBBY" | "PLAY" | "END";

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  hasMoved: boolean;
  color: string; // new
}

export interface PlayerProgress {
  collectedItems: string[];
}

export interface Spectator {
  id: string;
}

export interface GameRules {
  mode: "SINGLE" | "MULTI";
  maxPlayers: number;
  allowSpectators: boolean;
  collectiblesPerPlayer?: number;
}

export interface GameState {
  gameId: string;

  phase: GamePhase;
  hostId?: string;

  players: PlayerState[];
  spectators: Spectator[];

  rules: GameRules;

  board?: Board; // ❗ undefined in LOBBY
}
