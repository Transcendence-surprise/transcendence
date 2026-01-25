export type GamePhase = "LOBBY" | "PLAY" | "END";

export interface PositionedTile {
  type: "L" | "I" | "T" | "X";
  rotation: 0 | 90 | 180 | 270;
  x: number;
  y: number;
  collectableId?: string;
}

export interface Board {
  width: number;
  height: number;
  tiles: PositionedTile[][];
}
