import { LeaveResult, LeaveError } from "../models/leaveResult";
import { GameState } from "../models/state";

export function leaveGameEngine(
  state: GameState,
  playerId: number | string
  ): LeaveResult {
  if (!state) return { ok: false, error: LeaveError.GAME_NOT_FOUND };

  // Host leave: lobby - delete, play - remove host but keep game until only one player remains
  if (state.hostId == playerId) {
    if (state.phase === "PLAY" && state.rules.mode === "MULTI") {
      // Remove host from players (always index 0)
      state.players.splice(0, 1);
      if (state.players.length === 0) {
        console.log(`Host ${playerId} left the game. Game will be deleted (no players remain).`);
        return { ok: true, deleteGame: true };
      } else if (state.currentPlayerIndex === 0) {
        state.currentPlayerIndex = 0;
      } else {
        state.currentPlayerIndex = Math.max(0, state.currentPlayerIndex - 1);
      }
      // If only one player remains, signal game deletion
      if (state.players.length === 1) {
        console.log(`Only one player remains after host left ${playerId}. Game will be deleted.`);
        return { ok: true, deleteGame: true };
      }
      console.log(`Host ${playerId} left the game. Game continues.`);
      return { ok: true };
    }
    // Single mode or LOBBY: host leaves, game deleted
    console.log(`Host ${playerId} left the game. Game will be deleted (single mode or LOBBY).`);
    return { ok: true, deleteGame: true };
  }

  // Remove from players- use loose equality for ID comparison
  const playerIndex = state.players.findIndex(p => p.id == playerId);
  if (playerIndex >= 0) {
    state.players.splice(playerIndex, 1);
    // If no players remain, reset index and delete game
      if (state.players.length === 0) {
        console.log(`No players remains after player left ${playerId}`);
        return { ok: true, deleteGame: true };
      }
      // Update current player if needed
      if (state.currentPlayerIndex === playerIndex) {
        // If the leaving player is the current player, set to next player or 0
        state.currentPlayerIndex = state.players.length > playerIndex ? playerIndex : 0;
      } else if (playerIndex < state.currentPlayerIndex) {
        // If the leaving player is before the current player, decrement index
        state.currentPlayerIndex = Math.max(0, state.currentPlayerIndex - 1);
      }
    console.log(`Player left ${playerId}`);
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