import { GameState } from "../models/state";
import { StartResult, StartError } from "../models/startResult";

/**
 * Starts the game if rules are satisfied.
 * - Only host can start
 * - Multi-player requires at least 2 players
 * - Single-player starts immediately
 */
export function startGameEngine(
  state: GameState,
  playerId: number
): StartResult {
  // Already started?
  if (state.phase !== "LOBBY") {
    return { ok: false, error: StartError.ALREADY_STARTED };
  }

  // Only host can start
  if (state.hostId !== playerId) {
    return { ok: false, error: StartError.NOT_HOST };
  }

  // Multi-player: require minimum 2 players
  if (state.rules.mode === "MULTI" && state.players.length < 2) {
    return { ok: false, error: StartError.NOT_ENOUGH_PLAYERS };
  }

  // Everything OK → start
  state.phase = "PLAY";

  // For multi: first player is already currentPlayerId
  if (!state.currentPlayerId && state.players.length > 0) {
    state.currentPlayerIndex = 0;
    state.currentPlayerId = state.players[0].id;
  }

  return { ok: true };
}
