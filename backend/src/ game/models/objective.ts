export type LevelObjective =
  | { type: "COLLECT_ALL" }                       // single-player: all collectibles
  | { type: "COLLECT_N"; amount: number }         // multiplayer: assigned number
  | { type: "RETURN_HOME" }                       // both single & multi
  | { type: "REACH_EXIT" }; // optional for special special single-player objectives


export interface ObjectiveStatus {
  type: "COLLECT_ALL" | "COLLECT_N" | "RETURN_HOME" | "REACH_EXIT";
  done: boolean;
  progress?: number;
  amount?: number; // for COLLECT_N
}
