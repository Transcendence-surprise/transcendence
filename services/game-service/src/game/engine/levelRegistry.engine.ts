// engine/single-levels.ts
import { singlePlayerLevels } from '../factories/mapRegistry';
import { SingleLevelInfo } from '../models/levelInfo';

export function listSinglePlayerLevels(): SingleLevelInfo[] {
  return Object.entries(singlePlayerLevels).map(
    ([id, entry]) => ({
      id,
      name: entry.meta.name,
      description: entry.meta.description,
    })
  );
}
