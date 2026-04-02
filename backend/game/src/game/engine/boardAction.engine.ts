// src/game/engine/boardAction.engine.ts
import { GameState } from "../models/state";
import { Board } from "../models/board";
import { BoardAction } from "../models/boardAction";
import { applyBoardAction } from "../logic/boardMove.logic";
import { PositionedTile } from "../models/positionedTile";
import { BoardActionResult } from "../models/boardAction";
import { BoardActionError } from "../models/boardAction";
import { updatePlayerPositionsAfterShift } from "./helpers/playerPosUpdate";

export function processBoardAction(
  state: GameState,
  action: BoardAction
): BoardActionResult {
  if (!state) return { ok: false, error: BoardActionError.GAME_NOT_FOUND };

  // Check if board action is allowed
  if (state.rules.mode === "MULTI" && !state.boardActionsPending) {
    return { ok: false, error: BoardActionError.BOARD_ACTION_ALREADY_PERFORMED };
  }

  // Validate that rotating/swapping tiles don't have players on them
  if (action.type === "ROTATE_TILE") {
    const hasPlayer = state.players.some(p => p.x === action.x && p.y === action.y);
    if (hasPlayer) {
      return { ok: false, error: BoardActionError.INVALID_ACTION };
    }
  }

  if (action.type === "SWAP_TILES") {
    const hasPlayerOnTile1 = state.players.some(p => p.x === action.x1 && p.y === action.y1);
    const hasPlayerOnTile2 = state.players.some(p => p.x === action.x2 && p.y === action.y2);
    if (hasPlayerOnTile1 || hasPlayerOnTile2) {
      return { ok: false, error: BoardActionError.INVALID_ACTION };
    }
  }

  // Copy board to avoid mutation (optional)
  const board = cloneBoard(state.board);

  // Record player positions before the action (for shift tracking)
  const playerPositionsBefore = new Map(
    state.players.map(p => [p.id, { x: p.x, y: p.y }])
  );

  // Apply action depending on type
  try {
    applyBoardAction(board, action);
  } catch {
    // Map known errors to BoardActionError.INVALID_ACTION (or more specific if desired)
    return { ok: false, error: BoardActionError.INVALID_ACTION };
  }

  // If action is SHIFT, update player positions based on tile movement
  if (action.type === "SHIFT") {
    console.log("[SHIFT] Before player update:", state.players.map(p => ({ id: p.id, x: p.x, y: p.y })));
    updatePlayerPositionsAfterShift(
      state.players,
      state.board,
      board,
      action
    );
    console.log("[SHIFT] After player update:", state.players.map(p => ({ id: p.id, x: p.x, y: p.y })));
  }

  const player = state.players[state.currentPlayerIndex];

  // Update game state
  state.board = board;
  state.lastBoardAction = action;

  // MULTI: mark board action done
  if (state.rules.mode === "MULTI") {
    state.boardActionsPending = false;
  }
  player.totalMoves += 1;
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

