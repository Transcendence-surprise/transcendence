import { PositionedTile } from "./positionedTile";

export interface Board {
  width: number;
  height: number;
  tiles: PositionedTile[][];
}
