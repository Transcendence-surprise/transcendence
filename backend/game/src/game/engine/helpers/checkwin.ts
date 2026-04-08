// src/game/engine/helpers/checkwin.ts

import { GameState, PlayerState } from "src/game/models/state";

export function checkWinCondition(
  state: GameState,
  player: PlayerState
): boolean {
  const progress = state.playerProgress[player.id.toString()];
  if (!progress) return false;

  return progress.objectives.every(obj => obj.done);
}