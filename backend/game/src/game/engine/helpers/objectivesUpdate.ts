// src/game/engine/helpers/objectivesUpdate.ts
import { GameState, PlayerState } from "../../models/state";

export function updatePlayerObjectives(
  state: GameState,
  player: PlayerState
): void {
  const progress = state.playerProgress[player.id.toString()];
  if (!progress) return;

  for (const obj of progress.objectives) {
    switch (obj.type) {

      case "COLLECT_ALL": {
        const total = obj.amount ?? state.level.collectibles?.length ?? 0;

        obj.progress = progress.collectedItems.length;
        obj.done = obj.progress >= total;
        break;
      }

      case "COLLECT_N": {
        const target = obj.amount ?? 0;

        obj.progress = progress.collectedItems.length;
        obj.done = obj.progress >= target;
        break;
      }

      case "RETURN_HOME": {
        // we expect targetX/Y already injected earlier
        if (obj.targetX !== undefined && obj.targetY !== undefined) {
          obj.done = obj.done || (player.x === obj.targetX && player.y === obj.targetY);
        }
        break;
      }

      case "REACH_EXIT": {
        const exit = state.level.exitPoints?.[0];
        if (exit) {
          const atExit = player.x === exit.x && player.y === exit.y;
          obj.done = state.rules.mode === "SINGLE" 
            ? obj.done || atExit
            : atExit;
        }
        break;
      }
    }
  }
}