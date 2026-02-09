export type TileType = "L" | "I" | "T" | "X";

export type Rotation = 0 | 90 | 180 | 270;

export interface PositionedTile {
  type: TileType;
  rotation: 0 | 90 | 180 | 270;
  x: number;
  y: number;
  collectableId?: string;
  specialEffect?: "BONUS" | "CURSE" | "TELEPORT";
  fixed?: boolean;
}