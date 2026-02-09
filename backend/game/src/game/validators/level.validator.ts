
import { LevelMeta } from "../models/levelMeta";

export function validateMapTokens(
  map: string[][],
  levelId: string
): void {
  if (map.length === 0) {
    throw new Error(`Level ${levelId}: map is empty`);
  }

  const width = map[0].length;
  if (width === 0) {
    throw new Error(`Level ${levelId}: map rows are empty`);
  }

  for (const row of map) {
    if (row.length !== width) {
      throw new Error(
        `Level ${levelId}: non-rectangular map`
      );
    }

    for (const token of row) {
      if (typeof token !== "string") {
        throw new Error(
          `Level ${levelId}: invalid tile token ${String(token)}`
        );
      }
    }
  }
}

export function validateSingleLevelMeta(meta: LevelMeta): void {
  if (!meta.id) {
    throw new Error("LevelMeta: missing id");
  }

  if (!meta.objectives || meta.objectives.length === 0) {
    throw new Error(`Level ${meta.id}: no objectives defined`);
  }

  if (!meta.startingPoints || meta.startingPoints.length === 0) {
    throw new Error(`Level ${meta.id}: no startingPoints defined`);
  }

  for (const sp of meta.startingPoints) {
    if (
      typeof sp.x !== "number" ||
      typeof sp.y !== "number" ||
      !sp.playerId
    ) {
      throw new Error(
        `Level ${meta.id}: invalid starting point`
      );
    }
  }

  const hasReturnHome = meta.objectives.some(
    (o) => o.type === "RETURN_HOME"
  );

  if (hasReturnHome) {
    if (!meta.exitPoints || meta.exitPoints.length === 0) {
      throw new Error(
        `Level ${meta.id}: RETURN_HOME objective requires exitPoints`
      );
    }

    for (const ep of meta.exitPoints) {
      if (
        typeof ep.x !== "number" ||
        typeof ep.y !== "number"
      ) {
        throw new Error(
          `Level ${meta.id}: invalid exitPoint`
        );
      }
    }
  }
}
