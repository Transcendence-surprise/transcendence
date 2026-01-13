import { LevelMeta } from "../models/levelMmeta";

export const Puzzle01Meta: LevelMeta = {
  id: "puzzle-01",
  name: "First",

  objectives: [
    { type: "COLLECT_ALL" }
  ],

  constraints: { maxMoves: 8 },

  startingPoints: [{ playerId: "P1", x: 0, y: 0 }],

  collectibles: [
    { id: "C01", x: 1, y: 0 },
    { id: "C02", x: 1, y: 2 }
  ]
};
