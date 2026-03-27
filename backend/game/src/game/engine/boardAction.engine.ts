// src/game/engine/boardAction.engine.ts
import { GameState } from "../models/state";
import { Board } from "../models/board";
import { BoardAction } from "../models/boardAction";
import { applyBoardAction } from "../logic/boardMove.logic";
import { PositionedTile } from "../models/positionedTile";
import { BoardActionResult } from "../models/boardAction";
import { BoardActionError } from "../models/boardAction";

export function processBoardAction(
  state: GameState,
  action: BoardAction
): BoardActionResult {
  if (!state) return { ok: false, error: BoardActionError.GAME_NOT_FOUND };

  // Check if board action is allowed
  if (state.rules.mode === "MULTI" && !state.boardActionsPending) {
    return { ok: false, error: BoardActionError.BOARD_ACTION_ALREADY_PERFORMED };
  }

  // Copy board to avoid mutation (optional)
  const board = cloneBoard(state.board);

  // Apply action depending on type
  try {
    applyBoardAction(board, action);
  } catch {
    // Map known errors to BoardActionError.INVALID_ACTION (or more specific if desired)
    return { ok: false, error: BoardActionError.INVALID_ACTION };
  }

  // Update game state
  state.board = board;
  state.lastBoardAction = action;

  // MULTI: mark board action done
  if (state.rules.mode === "MULTI") {
    state.boardActionsPending = false;
  }

  // SINGLE: boardActionsPending remain true

  return { ok: true, action };
}

function cloneBoard(board: Board): Board {
  const tilesCopy: PositionedTile[][] = board.tiles.map(row =>
    row.map(tile => ({ ...tile })) // shallow copy of tile object
  );

  return {
    width: board.width,
    height: board.height,
    tiles: tilesCopy,
  };
}