import { LevelMeta } from "../models/levelMeta";

export const Puzzle07Meta: LevelMeta = {
  id: "puzzle-07",
  name: "7. Tiny Prison",

  objectives: [
    { type: "COLLECT_ALL", amount: 3 }
  ],

  constraints: {
    maxMoves: 4,
    levelLimitSec: 60
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 0 }
  ],

  collectibles: [
    { id: "C01", x: 2, y: 1 },
    { id: "C02", x: 0, y: 2 },
    { id: "C03", x: 3, y: 3 }
  ]
};