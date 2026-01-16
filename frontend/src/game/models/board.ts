// src/models/board.ts
export interface Tile {
  type: string;
  rotation: number;
  x: number;
  y: number;
}

export interface Board {
  width: number;
  height: number;
  tiles: Tile[][];
}
