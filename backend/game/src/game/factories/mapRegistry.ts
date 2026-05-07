import { LevelMeta } from "../models/levelMeta";

import s01Map from "../levels/01.map";
import s02Map from "../levels/02.map";
import s03Map from "../levels/03.map";
import s04Map from "../levels/04.map";
import s05Map from "../levels/05.map";
import s06Map from "../levels/06.map";
import s07Map from "../levels/07.map";
import s08Map from "../levels/08.map";
import s09Map from "../levels/09.map";
import s10Map from "../levels/10.map";

import { Puzzle01Meta } from "../levels/01.meta";
import { Puzzle02Meta } from "../levels/02.meta";
import { Puzzle03Meta } from "../levels/03.meta";
import { Puzzle04Meta } from "../levels/04.meta";
import { Puzzle05Meta } from "../levels/05.meta";
import { Puzzle06Meta } from "../levels/06.meta";
import { Puzzle07Meta } from "../levels/07.meta";
import { Puzzle08Meta } from "../levels/08.meta";
import { Puzzle09Meta } from "../levels/09.meta";
import { Puzzle10Meta } from "../levels/10.meta";

interface SingleLevelEntry {
  map: string[][];
  meta: LevelMeta;
}

export const singlePlayerLevels: Record<string, SingleLevelEntry> = {
  "puzzle-01": { map: s01Map, meta: Puzzle01Meta },
  "puzzle-02": { map: s02Map, meta: Puzzle02Meta },
  "puzzle-03": { map: s03Map, meta: Puzzle03Meta },
  "puzzle-04": { map: s04Map, meta: Puzzle04Meta },
  "puzzle-05": { map: s05Map, meta: Puzzle05Meta },
  "puzzle-06": { map: s06Map, meta: Puzzle06Meta },
  "puzzle-07": { map: s07Map, meta: Puzzle07Meta },
  "puzzle-08": { map: s08Map, meta: Puzzle08Meta },
  "puzzle-09": { map: s09Map, meta: Puzzle09Meta },
  "puzzle-10": { map: s10Map, meta: Puzzle10Meta }
  // add more here
};
