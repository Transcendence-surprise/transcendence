import { LevelMeta } from "../models/levelMeta";

export const Puzzle08Meta: LevelMeta = {
  id: "puzzle-08",
  name: "8. The Lock",

  objectives: [
    { type: "REACH_EXIT" }
  ],

  constraints: {
    maxMoves: 3,
    levelLimitSec: 60
  },

  startingPoints: [
    { slotId: "P1", x: 0, y: 0 }
  ],

  exitPoints: [
    { x: 4, y: 4 }
  ],

  collectibles: []
};