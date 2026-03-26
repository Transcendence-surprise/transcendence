// src/game/logic/boardMove.logic.ts
import { BoardAction } from "../models/boardAction";
import { Board } from "../models/board";
import { Rotation } from "../models/positionedTile";

/* ROTATE */

function rotateTile(board: Board, x: number, y: number): void {
  const tile = board.tiles[y]?.[x];
  if (!tile) throw new Error("Tile coordinates out of bounds");
  if (tile.fixed) {
    throw new Error(`rotateTile: Attempted to rotate fixed tile at (${x},${y})`);
  }

  tile.rotation = ((tile.rotation + 90) % 360) as Rotation;
}

/* SWAP */

function swapTiles(
  board: Board,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  const t1 = board.tiles[y1]?.[x1];
  const t2 = board.tiles[y2]?.[x2];
  if (!t1 || !t2) throw new Error("Tile coordinates out of bounds");
  if (t1.fixed || t2.fixed) {
    throw new Error(`swapTiles: Attempted to swap fixed tile(s) at (${x1},${y1}) or (${x2},${y2})`);
  }

  board.tiles[y1][x1] = t2;
  board.tiles[y2][x2] = t1;

  // keep coordinates correct
  t1.x = x2; t1.y = y2;
  t2.x = x1; t2.y = y1;
}

/* SHIFT ROW */

function shiftRow(
  board: Board,
  row: number,
  direction: "LEFT" | "RIGHT"
): void {
  const r = board.tiles[row];
  if (!r) throw new Error("Row out of bounds");
  // Prevent shifting if any tile is fixed
  if (r.some(tile => tile.fixed)) {
    throw new Error("Cannot shift row: contains fixed tile");
  }

  if (direction === "LEFT") {
    const first = r.shift()!;
    r.push(first);
  } else {
    const last = r.pop()!;
    r.unshift(last);
  }

  r.forEach((tile, x) => (tile.x = x));
}

/* SHIFT COL */

function shiftCol(
  board: Board,
  col: number,
  direction: "UP" | "DOWN"
): void {
  if (!board.tiles[0]?.[col]) throw new Error("Column out of bounds");
  const column = board.tiles.map(row => row[col]);
  // Prevent shifting if any tile is fixed
  if (column.some(tile => tile.fixed)) {
    throw new Error("Cannot shift column: contains fixed tile");
  }

  if (direction === "UP") {
    const first = column.shift()!;
    column.push(first);
  } else {
    const last = column.pop()!;
    column.unshift(last);
  }

  board.tiles.forEach((row, y) => {
    row[col] = column[y];
    row[col].y = y;
  });
}

export function applyBoardAction(board: Board, action: BoardAction) {
  switch (action.type) {
    case "ROTATE_TILE":
      rotateTile(board, action.x, action.y);
      break;
    case "SWAP_TILES":
      swapTiles(board, action.x1, action.y1, action.x2, action.y2);
      break;
    case "SHIFT":
      if (action.axis === "ROW") {
        shiftRow(board, action.index, action.direction);
      } else if (action.axis === "COL") {
        shiftCol(board, action.index, action.direction);
      }
      break;
  }
}