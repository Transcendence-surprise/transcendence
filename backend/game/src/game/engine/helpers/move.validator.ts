// src/game/engine/helpers/move.validator.ts
import { GameState, PlayerState } from "../../models/state";
import { PlayerAction } from "../../models/playerAction";
import { canMove } from "./canMove";

export function validatePlayerAction(
  state: GameState,
  player: PlayerState,
  action: PlayerAction
): { valid: boolean; reason?: string } {

  // Check it’s player’s turn (multi only)
  if (state.rules.mode === "MULTI" && state.currentPlayerId !== player.id) {
    return { valid: false, reason: "Not your turn" };
  }

  // Check player has moves left
  if (player.hasMoved) {
    return { valid: false, reason: "Player already moved this turn" };
  }

  // Validate path exists & is inside board
  if (action.path) {
    for (const step of action.path) {
      if (
        step.x < 0 ||
        step.x >= state.board.width ||
        step.y < 0 ||
        step.y >= state.board.height
      ) {
        return { valid: false, reason: "Move out of bounds" };
      }
    }
  }

  // Check wall collisions
  let current = { x: player.x, y: player.y };

  for (const step of action.path) {
    // Check move is valid between tiles (walls / openings)
    if (!canMove(state.board, current, step)) {
      return { valid: false, reason: "Path blocked by walls" };
    }

    // Move forward (only in local variable!)
    current = step;
  }

  return { valid: true };
}