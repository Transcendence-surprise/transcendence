// src/game/engine/helpers/move.validator.ts
import { GameState, PlayerState } from "../../models/state";
import { PlayerAction } from "../../models/playerAction";

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

  if (state.rules.mode === "SINGLE") {
    const progress = state.playerProgress[player.id.toString()];
    const totalMoves = progress?.totalMoves ?? 0;
    if (state.level.constraints?.maxMoves && totalMoves >= state.level.constraints.maxMoves) {
      return { valid: false, reason: "Max moves reached for this level" };
  }
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

  // 5️⃣ Optional: check wall collisions, special tiles, etc.
  // (we can add this later in movement helper)

  return { valid: true };
}