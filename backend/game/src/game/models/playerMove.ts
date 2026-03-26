// src/game/models/playerMove.ts

export interface MoveAction {
  type: "MOVE_PLAYER";
  playerId: string;
  path: { x: number; y: number }[];
}