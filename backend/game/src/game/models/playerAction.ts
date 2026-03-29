// src/game/models/playerAction.ts

export type PlayerAction = {
  path: { x: number; y: number }[];
}

export type PlayerActionResult =
  | { ok: true; action: PlayerAction }
  | { ok: false; error: PlayerActionError };

export enum PlayerActionError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  INVALID_ACTION = "INVALID_ACTION",
  NOT_YOUR_TURN = "NOT_YOUR_TURN",
  NOT_IN_GAME = "NOT_IN_GAME",
  PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND",
  REQUIRED_BOARD_ACTION = "REQUIRED_BOARD_ACTION",
}