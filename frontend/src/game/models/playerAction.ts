// src/game/models/playerAction.ts

export type PlayerAction = {
  path: { x: number; y: number }[];
}

export type PlayerMoveDto = {
  gameId: string;
  path: { x: number; y: number }[];
};