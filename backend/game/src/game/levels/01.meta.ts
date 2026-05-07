import { LevelMeta } from "../models/levelMeta";

export const Puzzle01Meta: LevelMeta = {
  id: "puzzle-01",
  name: "1. Let's start!",

  objectives: [
    { type: "COLLECT_ALL", amount: 3 }
  ],

  constraints: { maxMoves: 3, levelLimitSec: 60 },

  startingPoints: [{ slotId: "P1", x: 1, y: 0 }],

  collectibles: [
    { id: "C01", x: 2, y: 1 },
    { id: "C02", x: 0, y: 2 },
    { id: "C03", x: 2, y: 3 }
  ]
};
