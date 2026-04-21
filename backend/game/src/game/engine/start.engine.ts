//src/game/engine/start.engine.ts
import { GameState } from "../models/state";
import { StartResult, StartError } from "../models/startResult";
import { beginCurrentTurn } from "./helpers/turnHandler";
import { GamePhase } from '@transcendence/db-entities';

/**
 * Starts the game if rules are satisfied.
 * - Only host can start
 * - Multi-player requires at least 2 players
 * - Single-player starts immediately
 */
export function startGameEngine(
  state: GameState,
  playerId: number | string
): StartResult {
  // Already started?
  if (state.phase !== GamePhase.LOBBY) {
    return { ok: false, error: StartError.ALREADY_STARTED };
  }

  // Only host can start - normalize IDs to strings before comparison
  if (String(state.hostId) !== String(playerId)) {
    return { ok: false, error: StartError.NOT_HOST };
  }

  // Multi-player: require minimum 2 players
  if (state.rules.mode === "MULTI" && state.players.length < 2) {
    return { ok: false, error: StartError.NOT_ENOUGH_PLAYERS };
  }

  // Everything OK → start
  state.phase = GamePhase.PLAY;
  state.gameStartedAt = Date.now();

  // For multi: set first player as current
  if (state.players.length > 0) {
    state.currentPlayerIndex = 0;
    beginCurrentTurn(state);
  }

  return { ok: true };
}
