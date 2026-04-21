import { GameState, PlayerState } from "../../models/state";
import { GamePhase } from '@transcendence/db-entities';

export function applySinglePlayerLossIfNeeded(
  state: GameState,
  player: PlayerState,
): boolean {
  if (state.rules.mode !== "SINGLE" || state.phase === "END") return false;

  const maxMoves = state.level.constraints?.maxMoves;
  if (typeof maxMoves === "number" && player.totalMoves > maxMoves) {
    state.gameEnded = true;
    state.phase = GamePhase.END;
    state.gameResult = undefined;
    state.endReason = "LOSE_MAX_MOVES";
    return true;
  }

  const levelLimitSec = state.level.constraints?.levelLimitSec;
  if (
    typeof levelLimitSec === "number" &&
    typeof state.gameStartedAt === "number" &&
    Date.now() - state.gameStartedAt >= levelLimitSec * 1000
  ) {
    state.gameEnded = true;
    state.phase = GamePhase.END;
    state.gameResult = undefined;
    state.endReason = "LOSE_TIME_LIMIT";
    return true;
  }

  return false;
}