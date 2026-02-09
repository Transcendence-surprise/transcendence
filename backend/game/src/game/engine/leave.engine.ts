import { LeaveResult, LeaveError } from "../models/leaveResult";
import { GameState } from "../models/state";

export function leaveGameEngine(
  state: GameState,
  playerId: string
): LeaveResult {
  if (!state) return { ok: false, error: LeaveError.GAME_NOT_FOUND };

  // Prevent host from leaving
  if (state.hostId === playerId) {
    if (state.phase === "PLAY") {
        return { ok: false, error: LeaveError.HOST_CANNOT_LEAVE };
    }
    return { ok: true, deleteGame: true };
  }

  // Remove from players
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex >= 0) {
    state.players.splice(playerIndex, 1);

    // Update current player if needed
    if (state.currentPlayerId === playerId) {
      state.currentPlayerId = state.players[0]?.id ?? null;
      state.currentPlayerIndex = 0;
    }

    return { ok: true };
  }

  // Remove from spectators
  const spectatorIndex = state.spectators.findIndex(s => s.id === playerId);
  if (spectatorIndex >= 0) {
    state.spectators.splice(spectatorIndex, 1);
    return { ok: true };
  }

  return { ok: false, error: LeaveError.PLAYER_NOT_FOUND };
}