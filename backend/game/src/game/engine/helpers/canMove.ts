// src/game/engine/helpers/canMove.ts

import { Board } from "src/game/models/board";
import { PositionedTile } from "src/game/models/positionedTile";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export function getTileOpenings(tile: PositionedTile): Direction[] {
  switch (tile.type) {
    case "L":
      switch (tile.rotation) {
        case 0: return ["UP", "RIGHT"];
        case 90: return ["RIGHT", "DOWN"];
        case 180: return ["DOWN", "LEFT"];
        case 270: return ["LEFT", "UP"];
      }
    case "I":
      return tile.rotation % 180 === 0 ? ["UP", "DOWN"] : ["LEFT", "RIGHT"];
    case "T":
      switch (tile.rotation) {
        case 0: return ["UP", "DOWN", "RIGHT"];
        case 90: return ["LEFT", "RIGHT", "DOWN"];
        case 180: return ["UP", "DOWN", "LEFT"];
        case 270: return ["LEFT", "RIGHT", "UP"];
      }
    case "X":
      return ["UP", "DOWN", "LEFT", "RIGHT"];
  }
}

export function canMove(board: Board, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  const fromTile = board.tiles[from.y][from.x];
  const toTile = board.tiles[to.y][to.x];

  if (!fromTile || !toTile) return false;                  // out of bounds
  
  const fromOpenings = getTileOpenings(fromTile);
  const toOpenings = getTileOpenings(toTile);
  console.log(`canMove from (${from.x},${from.y}) to (${to.x},${to.y}):`, fromOpenings, toOpenings);
  // Determine direction from 'from' → 'to'
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 1 && dy === 0) {
    return fromOpenings.includes("RIGHT") && toOpenings.includes("LEFT");
  }

  if (dx === -1 && dy === 0) {
    return fromOpenings.includes("LEFT") && toOpenings.includes("RIGHT");
  }

  if (dx === 0 && dy === 1) {
    return fromOpenings.includes("DOWN") && toOpenings.includes("UP");
  }

  if (dx === 0 && dy === -1) {
    return fromOpenings.includes("UP") && toOpenings.includes("DOWN");
  }

  return false; // not adjacent
}