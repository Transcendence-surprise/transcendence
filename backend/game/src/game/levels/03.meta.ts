import { LevelMeta } from "../models/levelMeta";

export const Puzzle03Meta: LevelMeta = {
  id: "puzzle-03",
  name: "Third",

  objectives: [
    { type: "COLLECT_ALL" }
  ],

  constraints: { maxMoves: 12 },

  startingPoints: [{ slotId: "P1", x: 0, y: 0 }],

  collectibles: [
    { id: "C01", x: 1, y: 1 },
    { id: "C02", x: 2, y: 2 },
    { id: "C03", x: 1, y: 2 }
  ]
};
