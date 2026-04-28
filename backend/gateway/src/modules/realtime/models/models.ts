// src/modules/realtime/models.ts

import { Socket } from "node_modules/socket.io/dist/socket";

export interface JwtPayload {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

export interface WsUser {
  sub: number | string;
  username: string;
  email: string;
  roles: string[];
}

export interface GameStatePayload {
  ok?: boolean;
  error?: string;
  state?: {
    phase?: string;
    board?: unknown;
    players?: Array<{ id: string | number; name?: string; username?: string; displayName?: string }>;
    rules?: unknown;
    hostId?: string | number;
    playerProgress?: unknown;
    playerProgressById?: Record<string, unknown>;
    currentPlayerId?: string | number;
    gameStartedAt?: number;
    moveStartedAt?: number;
    moveLimitPerTurnSec?: number;
    boardActionsPending?: unknown;
    gameResult?: { winnerIds?: Array<string | number>; winnerId?: string | number };
    endReason?: string | null;
    spectators?: Array<{ id: string | number }>;
  };
  gameId?: string;
  phase?: string;
  board?: unknown;
  players?: Array<{ id: string | number; name?: string; username?: string; displayName?: string }>;
  rules?: unknown;
  hostId?: string | number;
  playerProgress?: unknown;
  playerProgressById?: Record<string, unknown>;
  currentPlayerId?: string | number;
  gameStartedAt?: number;
  moveStartedAt?: number;
  moveLimitPerTurnSec?: number;
  boardActionsPending?: unknown;
  gameResult?: { winnerIds?: Array<string | number>; winnerId?: string | number };
  endReason?: string | null;
  spectators?: Array<{ id: string | number }>;
}

export interface ResolvedGameState {
  phase?: string;
  board?: unknown;
  players?: Array<{ id: string | number; name?: string; username?: string; displayName?: string }>;
  rules?: any;
  hostId?: string | number;
  playerProgress?: unknown;
  playerProgressById?: Record<string, unknown>;
  currentPlayerId?: string | number;
  gameStartedAt?: number;
  moveStartedAt?: number;
  moveLimitPerTurnSec?: number;
  boardActionsPending?: unknown;
  gameResult?: { winnerIds?: Array<string | number>; winnerId?: string | number };
  endReason?: string | null;
  spectators?: Array<{ id: string | number }>;
}

export type TypedSocket = Socket & { user?: WsUser };