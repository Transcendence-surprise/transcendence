import { LevelMeta } from "../models/levelMeta";

export const Puzzle09Meta: LevelMeta = {
  id: "puzzle-09",
  name: "9. Wide Illusion",

  objectives: [
    { type: "COLLECT_N", amount: 4 },
    { type: "REACH_EXIT" }
  ],

  constraints: {
    maxMoves: 8,
    levelLimitSec: 100
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 0 }
  ],

  exitPoints: [
    { x: 6, y: 6 }
  ],

  collectibles: [
    { id: "C01", x: 2, y: 2 },
    { id: "C02", x: 4, y: 2 },
    { id: "C03", x: 2, y: 4 },
    { id: "C04", x: 4, y: 4 },
    { id: "C05", x: 6, y: 0 }, // bait top
    { id: "C06", x: 0, y: 6 }  // bait bottom
  ]
};