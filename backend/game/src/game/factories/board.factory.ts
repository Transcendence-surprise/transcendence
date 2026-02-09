import { Board } from "../models/board";
import { PositionedTile, TileType, Rotation } from "../models/positionedTile";
import { createRuntimeTile } from "./tile.factory";


function randomRotation(): Rotation {
  return [0, 90, 180, 270][Math.floor(Math.random() * 4)] as Rotation;
}

function randomTileType(): TileType {
  const r = Math.random();
  if (r < 0.6) return "L";
  if (r < 0.85) return "I";
  return "T";
}

export function createEmptyBoard(size: number): Board {
  const tiles: PositionedTile[][] = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) =>
      createRuntimeTile("I", 0, x, y)
    )
  );

  return {
    width: size,
    height: size,
    tiles,
  };
}

export function applyFixedCorners(board: Board): void {
  const last = board.width - 1;

  board.tiles[0][0] =
    createRuntimeTile("L", 90, 0, 0, true);

  board.tiles[0][last] =
    createRuntimeTile("L", 180, last, 0, true);

  board.tiles[last][0] =
    createRuntimeTile("L", 0, 0, last, true);

  board.tiles[last][last] =
    createRuntimeTile("L", 270, last, last, true);
}

export function fillBoardRandomly(board: Board): void {
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const tile = board.tiles[y][x];
      if (tile.fixed) continue;

      board.tiles[y][x] = createRuntimeTile(
        randomTileType(),
        randomRotation(),
        x,
        y
      );
    }
  }
}

export function createMultiplayerBoard(size: number): Board {
  const board = createEmptyBoard(size);
  applyFixedCorners(board);
  fillBoardRandomly(board);
  return board;
}
