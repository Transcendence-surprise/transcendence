// src/game/models/boardAction.ts

type RowShift = {
  type: "SHIFT";
  axis: "ROW";
  index: number;
  direction: "LEFT" | "RIGHT";
};

type ColShift = {
  type: "SHIFT";
  axis: "COL";
  index: number;
  direction: "UP" | "DOWN";
};

export type BoardAction =
  | { type: "ROTATE_TILE"; x: number; y: number }
  | { type: "SWAP_TILES"; x1: number; y1: number; x2: number; y2: number }
  | RowShift
  | ColShift;

export type BoardActionResult =
  | { ok: true; action: BoardAction }
  | { ok: false; error: BoardActionError };

export enum BoardActionError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  INVALID_ACTION = "INVALID_ACTION",
  NOT_YOUR_TURN = "NOT_YOUR_TURN",
  BOARD_ACTION_ALREADY_PERFORMED = "BOARD_ACTION_ALREADY_PERFORMED",
  NOT_IN_GAME = "NOT_IN_GAME",
  PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND",
}