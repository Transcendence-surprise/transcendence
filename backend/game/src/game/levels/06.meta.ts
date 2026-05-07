import { LevelMeta } from "../models/levelMeta";

export const Puzzle06Meta: LevelMeta = {
  id: "puzzle-06",
  name: "6. False Hope",

  objectives: [
    { type: "COLLECT_N", amount: 2 },
    { type: "REACH_EXIT" }
  ],

  constraints: {
    maxMoves: 4,
    levelLimitSec: 70
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 0 }
  ],

  exitPoints: [
    { x: 5, y: 5 }
  ],

  collectibles: [
    { id: "C01", x: 2, y: 2 }, // center bait
    { id: "C02", x: 4, y: 2 },
    { id: "C03", x: 0, y: 4 }  // only viable early pickup
  ]
};