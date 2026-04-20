import { LeaveResult, LeaveError } from "../models/leaveResult";
import { GameState } from "../models/state";

export function leaveGameEngine(
  state: GameState,
  playerId: number | string
  ): LeaveResult {
  if (!state) return { ok: false, error: LeaveError.GAME_NOT_FOUND };

  const leavingPlayerId = String(playerId);
  const hostId = String(state.hostId);

  // Host leave: lobby - delete, play - remove host but keep game until only one player remains
  if (hostId === leavingPlayerId) {
    if (state.phase === "PLAY" && state.rules.mode === "MULTI") {
      const previousCurrentPlayerId = state.players[state.currentPlayerIndex]?.id;
      // Remove host from players
      const hostPlayerIndex = state.players.findIndex(
        (player) => String(player.id) === hostId,
      );
      if (hostPlayerIndex < 0) {
        return { ok: false, error: LeaveError.PLAYER_NOT_FOUND };
      }
      state.players.splice(hostPlayerIndex, 1);
      if (state.players.length === 0) {
        // console.log(`Host ${playerId} left the game. Game will be deleted (no players remain).`);
        return { ok: true, deleteGame: true };
      }

      if (state.currentPlayerIndex > hostPlayerIndex) {
        state.currentPlayerIndex = Math.max(0, state.currentPlayerIndex - 1);
      } else if (state.currentPlayerIndex >= state.players.length) {
        state.currentPlayerIndex = 0;
      }

      // If only one player remains, signal game deletion
      if (state.players.length === 1) {
        // console.log(`Only one player remains after host left ${playerId}. Game will be deleted.`);
        return { ok: true, deleteGame: true };
      }

      const nextCurrentPlayer = state.players[state.currentPlayerIndex];
      if (nextCurrentPlayer) {
        state.currentPlayerId = nextCurrentPlayer.id;

        if (String(previousCurrentPlayerId) !== String(nextCurrentPlayer.id)) {
          state.moveStartedAt = Date.now();
          for (const player of state.players) {
            player.hasMoved = false;
          }
          state.boardActionsPending = state.rules.requiresBoardActionPerTurn;
        }
      }

      // console.log(`Host ${playerId} left the game. Game continues.`);
      return { ok: true };
    }
    // Single mode or LOBBY: host leaves, game deleted
    // console.log(`Host ${playerId} left the game. Game will be deleted (single mode or LOBBY).`);
    return { ok: true, deleteGame: true };
  }

  // Remove from players
  const playerIndex = state.players.findIndex(
    (player) => String(player.id) === leavingPlayerId,
  );
  if (playerIndex >= 0) {
    const previousCurrentPlayerId = state.players[state.currentPlayerIndex]?.id;
    state.players.splice(playerIndex, 1);

    // In LOBBY, non-host leaving must not delete the game.
    if (state.phase === "LOBBY") {
      return { ok: true };
    }

    // If no players remain, reset index and delete game
      if (state.players.length === 0) {
        // console.log(`No players remains after player left ${playerId}`);
        return { ok: true, deleteGame: true };
      }
      // If only one player remains in multiplayer PLAY phase, delete game
      // (In LOBBY, game must stay alive unless host leaves.)
      if (
        state.phase === "PLAY" &&
        state.rules.mode === "MULTI" &&
        state.players.length === 1
      ) {
        // console.log(`Only one player remains after player left ${playerId}. Game will be deleted.`);
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

    const nextCurrentPlayer = state.players[state.currentPlayerIndex];
    if (nextCurrentPlayer) {
      state.currentPlayerId = nextCurrentPlayer.id;

      if (String(previousCurrentPlayerId) !== String(nextCurrentPlayer.id)) {
        state.moveStartedAt = Date.now();
        for (const player of state.players) {
          player.hasMoved = false;
        }
        state.boardActionsPending = state.rules.requiresBoardActionPerTurn;
      }
    }

    // console.log(`Player left ${playerId}`);
    return { ok: true };
  }

  // Remove from spectators
  const spectatorIndex = state.spectators.findIndex(
    (spectator) => String(spectator.id) === leavingPlayerId,
  );
  if (spectatorIndex >= 0) {
    state.spectators.splice(spectatorIndex, 1);
    return { ok: true };
  }

  return { ok: false, error: LeaveError.PLAYER_NOT_FOUND };
}