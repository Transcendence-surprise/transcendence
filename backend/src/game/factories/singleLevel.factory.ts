import { Board } from "../models/board";
import { Level } from "../models/level";
import { LevelMeta } from "../models/levelMeta";
import { createTile } from "./tile.factory";
import { PositionedTile } from "../models/positionedTile";
import { validateSingleLevelMeta, validateMapTokens } from "../validators/level.validator";
import { singlePlayerLevels } from "./mapRegistry";

export function createSingleplayerLevel(
  mapTokens: string[][],
  meta: LevelMeta
): Level {
  
  validateSingleLevelMeta(meta);
  validateMapTokens(mapTokens, meta.id);

  const tiles: PositionedTile[][] = mapTokens.map((row, y) =>
    row.map((token, x) => createTile(token, x, y))
  );

  const collectibles = meta.collectibles ?? [];

  console.log("collectibles:", meta.collectibles);

  for (const c of collectibles) {
    if (typeof c.x !== "number" || typeof c.y !== "number") continue;

    const tile = tiles[c.y][c.x];
    if (tile) tile.collectableId = c.id;
  }



  const board: Board = {
    width: tiles[0].length,
    height: tiles.length,
    tiles
  };

  return {
    id: meta.id,
    name: meta.name,
    board,
    startingPoints: meta.startingPoints ?? [],
    exitPoints: meta.exitPoints ?? [],
    objectives: meta.objectives ?? [],
    constraints: meta.constraints,
    collectibles: meta.collectibles ?? []
  };
}

/**
 * Look up a single-player level by ID and return a Level.
 */
export function getSingleplayerLevelById(levelId: string) {
  const entry = singlePlayerLevels[levelId];
  if (!entry) {
    throw new Error(`Single-player level not found: ${levelId}`);
  }

  const { map, meta } = entry;

  return createSingleplayerLevel(map, meta);
}