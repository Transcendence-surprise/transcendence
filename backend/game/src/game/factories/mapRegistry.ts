import s01Map from "../levels/01.map";
import { Puzzle01Meta } from "../levels/01.meta";
import s02Map from "../levels/02.map";
import s03Map from "../levels/03.map";
import { Puzzle02Meta } from "../levels/02.meta";
import { Puzzle03Meta } from "../levels/03.meta";
import { LevelMeta } from "../models/levelMeta";

interface SingleLevelEntry {
  map: string[][];
  meta: LevelMeta;
}

export const singlePlayerLevels: Record<string, SingleLevelEntry> = {
  "puzzle-01": { map: s01Map, meta: Puzzle01Meta },
  "puzzle-02": { map: s02Map, meta: Puzzle02Meta },
  "puzzle-03": { map: s03Map, meta: Puzzle03Meta },
  // add more here
};
