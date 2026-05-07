import { LevelMeta } from "../models/levelMeta";

export const Puzzle04Meta: LevelMeta = {
  id: "puzzle-04",
  name: "4. Commitment Issues",

  objectives: [
    { type: "COLLECT_N", amount: 3 },
    { type: "REACH_EXIT" },
    { type: "RETURN_HOME" }
  ],

  constraints: {
    maxMoves: 7,
    levelLimitSec: 90
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 0 }
  ],

  exitPoints: [
    { x: 5, y: 5 }
  ],

  collectibles: [
    { id: "C01", x: 2, y: 0 },
    { id: "C02", x: 0, y: 4 },
    { id: "C03", x: 4, y: 4 },
    { id: "C04", x: 5, y: 2 } // bait again
  ]
};