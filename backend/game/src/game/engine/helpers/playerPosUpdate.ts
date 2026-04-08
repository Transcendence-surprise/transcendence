// src/game/engine/helpers/playerPosUpdate.ts

import { Board } from "src/game/models/board";
import { BoardAction } from "src/game/models/boardAction";
import { PlayerState } from "src/game/models/state";

export function updatePlayerPositionsAfterShift(
  players: PlayerState[],
  boardBefore: Board,
  _boardAfter: Board,
  action: BoardAction
): void {
  // Only handle SHIFT actions
  if (action.type !== "SHIFT") return;

  const boardWidth = boardBefore.tiles[0]?.length ?? 0;
  const boardHeight = boardBefore.tiles.length;

  for (const player of players) {
    // Calculate new position based on shift direction and axis
    let newX = player.x;
    let newY = player.y;

    if (action.axis === "ROW" && action.index === player.y) {
      // Player is on the row that's being shifted
      if (action.direction === "LEFT") {
        newX = (player.x - 1 + boardWidth) % boardWidth;
      } else if (action.direction === "RIGHT") {
        newX = (player.x + 1) % boardWidth;
      }
    } else if (action.axis === "COL" && action.index === player.x) {
      // Player is on the column that's being shifted
      if (action.direction === "UP") {
        newY = (player.y - 1 + boardHeight) % boardHeight;
      } else if (action.direction === "DOWN") {
        newY = (player.y + 1) % boardHeight;
      }
    }

    player.x = newX;
    player.y = newY;
  }
}