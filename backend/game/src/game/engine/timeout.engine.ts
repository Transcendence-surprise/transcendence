// timeout.engine.ts

import { GameState } from '../models/state';
import { leaveGameEngine } from './leave.engine';
import { advanceTurn, beginCurrentTurn } from './helpers/turnHandler';
import { GamePhase } from '@transcendence/db-entities';

export type MultiTimeoutResult =
  | {
      type: 'PLAY_UPDATE';
    }
  | {
      type: 'PLAYER_REMOVED';
      removedPlayerIds: Array<string | number>;
      deleteGame: boolean;
    }
  | null;

export function applySingleTimeout(
  state: GameState,
  now: number,
): boolean {
  if (state.phase !== GamePhase.PLAY) return false;
  if (state.rules.mode !== 'SINGLE') return false;

  const limit = state.level.constraints?.levelLimitSec;
  if (typeof limit !== 'number' || typeof state.gameStartedAt !== 'number') {
    return false;
  }

  if (now - state.gameStartedAt < limit * 1000) return false;

  state.gameEnded = true;
  state.phase = GamePhase.END;
  state.gameResult = undefined;
  state.endReason = 'LOSE_TIME_LIMIT';

  return true;
}

export function applyMultiTimeout(
  state: GameState,
  now: number,
): MultiTimeoutResult {
  if (state.phase !== GamePhase.PLAY) return null;
  if (state.rules.mode !== 'MULTI') return null;

  const limit = state.rules.moveLimitPerTurnSec;
  if (typeof limit !== 'number' || typeof state.moveStartedAt !== 'number') {
    return null;
  }

  const timedOut = now - state.moveStartedAt >= limit * 1000;
  if (!timedOut) return null;

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return null;

  if (currentPlayer.skipsLeft > 0) {
    currentPlayer.skipsLeft -= 1;
  }

  if (currentPlayer.skipsLeft <= 0) {
    const removedPlayerId = currentPlayer.id;

    const result = leaveGameEngine(state, removedPlayerId);
    if (!result.ok) return null;

    if (result.deleteGame) {
      return {
        type: 'PLAYER_REMOVED',
        removedPlayerIds: [removedPlayerId],
        deleteGame: true,
      };
    }

    const nextPlayer = state.players[state.currentPlayerIndex];
    if (nextPlayer) {
      beginCurrentTurn(state, now);
    }

    return {
      type: 'PLAYER_REMOVED',
      removedPlayerIds: [removedPlayerId],
      deleteGame: false,
    };
  }

  advanceTurn(state);
  state.moveStartedAt = now;

  return { type: 'PLAY_UPDATE' };
}