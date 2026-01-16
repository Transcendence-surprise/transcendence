// src/game/models/GameStateDto.ts

import { Board } from "./board";

export type GamePhase = "LOBBY" | "PLAY" | "END";

export interface PlayerDto {
  id: string;
  x: number;
  y: number;
}

export interface SpectatorDto {
  id: string;
}

export interface GameRulesDto {
  mode: "SINGLE" | "MULTI";
  maxPlayers: number;
  allowSpectators: boolean;
  collectiblesPerPlayer?: number;
}

export interface GameState {
  gameId: string;

  phase: GamePhase;
  hostId?: string;

  players: PlayerDto[];
  spectators: SpectatorDto[];

  rules: GameRulesDto;

  board?: Board; // ❗ undefined in LOBBY
}
