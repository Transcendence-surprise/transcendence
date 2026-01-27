import { PositionedTile } from "../models/positionedTile";
import { TileType, Rotation } from "../models/positionedTile";

const VALID_TYPES = ["L", "I", "T", "X"] as const;

export function parseTile(
  token: string,
  x: number,
  y: number
): PositionedTile {
  if (!token || token.length < 2) {
    throw new Error(`Invalid tile token: ${token}`);
  }

  const type = token[0] as TileType;
  const rotIndex = Number(token[1]);

  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid tile type: ${token}`);
  }

  if (isNaN(rotIndex) || rotIndex < 0 || rotIndex > 3) {
    throw new Error(`Invalid tile rotation: ${token}`);
  }

  return {
    type,
    rotation: (rotIndex * 90) as Rotation,
    x,
    y
  };
}

export function createTile(token: string, x: number, y: number): PositionedTile {
  return parseTile(token, x, y);
}

export function createRuntimeTile(
  type: TileType,
  rotation: Rotation,
  x: number,
  y: number,
  fixed = false
): PositionedTile {
  return {
    type,
    rotation,
    x,
    y,
    fixed,
  };
}
