import { LevelMeta } from "../models/levelMeta";

export const Puzzle02Meta: LevelMeta = {
  id: "puzzle-01",
  name: "Second",

  startingPoints: [{ slotId: "P1", x: 0, y: 0 }],

  exitPoints: [{ x: 2, y: 2 }],

  objectives: [
    { type: "COLLECT_ALL" }
  ],

  constraints: { maxMoves: 8 },

  collectibles: [
    { id: "C01", x: 1, y: 0 },
    { id: "C02", x: 1, y: 2 }
  ]
};


// objectives: [
//   { type: "COLLECT_ALL" },
//   { type: "REACH_EXIT" }
// ]

// objectives: [
//   { type: "REACH_EXIT" }
// ]

