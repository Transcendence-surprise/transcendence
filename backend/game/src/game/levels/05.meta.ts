import { LevelMeta } from "../models/levelMeta";

export const Puzzle05Meta: LevelMeta = {
  id: "puzzle-05",
  name: "5. Point of No Return",

  objectives: [
    { type: "COLLECT_N", amount: 3 },
    { type: "REACH_EXIT" }
  ],

  constraints: {
    maxMoves: 6,
    levelLimitSec: 80
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 5 }
  ],

  exitPoints: [
    { x: 5, y: 0 }
  ],

  collectibles: [
    { id: "C01", x: 2, y: 0 },
    { id: "C02", x: 5, y: 2 },
    { id: "C03", x: 1, y: 4 },
    { id: "C04", x: 4, y: 4 } // trap collectible
  ]
};