import { LevelMeta } from "../models/levelMeta";

export const Puzzle10Meta: LevelMeta = {
  id: "puzzle-10",
  name: "10. Labyrinth Core",

  objectives: [
    { type: "COLLECT_N", amount: 5 },
    { type: "REACH_EXIT" }
  ],

  constraints: {
    maxMoves: 10,
    levelLimitSec: 120
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 4 }
  ],

  exitPoints: [
    { x: 8, y: 8 }
  ],

  collectibles: [
    { id: "C01", x: 2, y: 2 },
    { id: "C02", x: 6, y: 2 },
    { id: "C03", x: 4, y: 4 },
    { id: "C04", x: 2, y: 6 },
    { id: "C05", x: 6, y: 6 },
    { id: "C06", x: 8, y: 0 },
    { id: "C07", x: 0, y: 8 }
  ]
};