// src/game/engine/compileObjectives.engine.ts
import { GameRules, GameSettings } from "../models/state";
import { LevelObjective, ObjectiveStatus } from "../models/objective";
import { Level } from "../models/level";

/**
 * Compile LevelObjective[] into ObjectiveStatus[] for a player.
 * 
 * For single-player: use meta objectives directly.
 * For multiplayer: generate standard objectives: COLLECT_N + RETURN_HOME
 */
export function compileObjectives(
  level: Level,
  rules: GameRules,
): ObjectiveStatus[] {
  if (rules.mode === "SINGLE") {
    return level.objectives.map<ObjectiveStatus>((obj: LevelObjective) => {
      const status: ObjectiveStatus = {
        type: obj.type,
        done: false,
      };

      // progress/amount for COLLECT_ALL or COLLECT_N
      if (obj.type === "COLLECT_ALL" || obj.type === "COLLECT_N") {
        status.amount = obj.amount ?? level.collectibles?.length ?? 0;
        status.progress = 0;
      }

      // REACH_EXIT target
      if (obj.type === "REACH_EXIT" && level.exitPoints?.[0]) {
        status.targetX = level.exitPoints[0].x;
        status.targetY = level.exitPoints[0].y;
      }

      // RETURN_HOME uses player's starting slot
      if (obj.type === "RETURN_HOME") {
        status.targetX = level.startingPoints[0]?.x;
        status.targetY = level.startingPoints[0]?.y;
      }

      return status;
    });
  }

  // Multiplayer
  return [
    {
      type: "COLLECT_N",
      done: false,
      progress: 0,
      amount: rules.collectiblesPerPlayer ?? 0,
    },
    {
      type: "RETURN_HOME",
      done: false,
    },
  ];
}
