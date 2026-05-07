import { LevelMeta } from "../models/levelMeta";

export const Puzzle03Meta: LevelMeta = {
  id: "puzzle-03",
  name: "3. No Way Back",

  objectives: [
    { type: "COLLECT_N", amount: 2 },
    { type: "REACH_EXIT" }
  ],

  constraints: {
    maxMoves: 5,
    levelLimitSec: 75
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 0 }
  ],

  exitPoints: [
    { x: 4, y: 4 }
  ],

  collectibles: [
    { id: "C01", x: 2, y: 0 },
    { id: "C02", x: 2, y: 4 },
    { id: "C03", x: 4, y: 2 } // bait collectible (optional)
  ]
};