export type GamePhase = "LOBBY" | "PLAY" | "END";

export interface PositionedTile {
  type: "L" | "I" | "T" | "X" | "W";
  rotation: 0 | 90 | 180 | 270;
  x: number;
  y: number;
  collectableId?: string;
  fixed?: boolean;
}

export interface Board {
  width: number;
  height: number;
  tiles: PositionedTile[][];
}
