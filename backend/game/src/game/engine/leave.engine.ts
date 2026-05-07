import { LeaveResult, LeaveError } from "../models/leaveResult";
import { GameState } from "../models/state";

export function leaveGameEngine(
  state: GameState,
  playerId: number | string
  ): LeaveResult {
  if (!state) return { ok: false, error: LeaveError.GAME_NOT_FOUND };

  const leavingPlayerId = String(playerId);
  const hostId = String(state.hostId);

  if (hostId === leavingPlayerId) {
    if (state.phase === "PLAY" && state.rules.mode === "MULTI") {
      const previousCurrentPlayerId = state.players[state.currentPlayerIndex]?.id;
      const hostPlayerIndex = state.players.findIndex(
        (player) => String(player.id) === hostId,
      );
      if (hostPlayerIndex < 0) {
        return { ok: false, error: LeaveError.PLAYER_NOT_FOUND };
      }
      state.players.splice(hostPlayerIndex, 1);
      if (state.players.length === 0) {

        return { ok: true, deleteGame: true };
      }

      if (state.currentPlayerIndex > hostPlayerIndex) {
        state.currentPlayerIndex = Math.max(0, state.currentPlayerIndex - 1);
      } else if (state.currentPlayerIndex >= state.players.length) {
        state.currentPlayerIndex = 0;
      }

      if (state.players.length === 1) {
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

      return { ok: true };
    }
    return { ok: true, deleteGame: true };
  }

  const playerIndex = state.players.findIndex(
    (player) => String(player.id) === leavingPlayerId,
  );
  if (playerIndex >= 0) {
    const previousCurrentPlayerId = state.players[state.currentPlayerIndex]?.id;
    state.players.splice(playerIndex, 1);

    if (state.players.length === 0) {
      return { ok: true, deleteGame: true };
    }

    if (state.currentPlayerIndex === playerIndex) {
      state.currentPlayerIndex = state.players.length > playerIndex ? playerIndex : 0;
    } else if (playerIndex < state.currentPlayerIndex) {
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

    if (state.phase === "LOBBY") {
      return { ok: true };
    }

    if (
      state.phase === "PLAY" &&
      state.rules.mode === "MULTI" &&
      state.players.length === 1
    ) {
      return { ok: true, deleteGame: true };
    }

    return { ok: true };
  }

  const spectatorIndex = state.spectators.findIndex(
    (spectator) => String(spectator.id) === leavingPlayerId,
  );
  if (spectatorIndex >= 0) {
    state.spectators.splice(spectatorIndex, 1);
    return { ok: true };
  }

  return { ok: false, error: LeaveError.PLAYER_NOT_FOUND };
}
