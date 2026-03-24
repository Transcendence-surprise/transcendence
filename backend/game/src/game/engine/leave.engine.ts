import { LeaveResult, LeaveError } from "../models/leaveResult";
import { GameState } from "../models/state";

export function leaveGameEngine(
  state: GameState,
  playerId: number | string
  ): LeaveResult {
  if (!state) return { ok: false, error: LeaveError.GAME_NOT_FOUND };

  // Prevent host from leaving - use loose equality for type compatibility
  if (state.hostId == playerId) {
    if (state.phase === "PLAY") {
      // Remove host from players (always index 0)
      state.players.splice(0, 1);
      // Update currentPlayerIndex if needed
      if (state.currentPlayerIndex === 0) {
        // If host was current player, set to next or 0
        state.currentPlayerIndex = state.players.length > 0 ? 0 : 0;
      } else {
        // If host was before current player, decrement index
        state.currentPlayerIndex--;
      }
      // If only one player remains, signal game deletion
      if (state.players.length === 1) {
        return { ok: true, deleteGame: true };
      }
      return { ok: true };
    }
    return { ok: true, deleteGame: true };
  }

  // Remove from players - use loose equality
  const playerIndex = state.players.findIndex(p => p.id == playerId);
  if (playerIndex >= 0) {
    state.players.splice(playerIndex, 1);

    // Update current player if needed
    if (state.currentPlayerIndex === playerIndex) {
      // If the leaving player is the current player, set to next player or 0
      if (state.players.length > 0) {
        state.currentPlayerIndex = state.players.length > playerIndex ? playerIndex : 0;
      } else {
        state.currentPlayerIndex = 0;
      }
    } else if (playerIndex < state.currentPlayerIndex) {
      // If the leaving player is before the current player, decrement index
      state.currentPlayerIndex--;
    }

    // If only one player remains, signal game deletion
    if (state.players.length === 1) {
      return { ok: true, deleteGame: true };
    }

    return { ok: true };
  }

  // Remove from spectators - use loose equality
  const spectatorIndex = state.spectators.findIndex(s => s.id == playerId);
  if (spectatorIndex >= 0) {
    state.spectators.splice(spectatorIndex, 1);
    return { ok: true };
  }

  return { ok: false, error: LeaveError.PLAYER_NOT_FOUND };
}