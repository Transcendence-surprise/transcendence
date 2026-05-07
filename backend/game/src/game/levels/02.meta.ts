import { LevelMeta } from "../models/levelMeta";

export const Puzzle02Meta: LevelMeta = {
  id: "puzzle-02",
  name: "2. Twisted Paths",

  objectives: [
    { type: "COLLECT_ALL", amount: 4 }
  ],

  constraints: {
    maxMoves: 6,
    levelLimitSec: 90
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 0 }
  ],

  collectibles: [
    { id: "C01", x: 4, y: 0 },
    { id: "C02", x: 2, y: 2 },
    { id: "C03", x: 0, y: 4 },
    { id: "C04", x: 4, y: 4 }
  ]
};
