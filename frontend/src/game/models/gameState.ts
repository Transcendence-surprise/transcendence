// import { Board } from "./board";
// import { Level } from "./level";
// import { ObjectiveStatus } from "./objective";
// import { BoardAction } from "./boardAction";

// export type GamePhase = "LOBBY" | "PLAY" | "END";

// export interface PlayerState {
//   id: string;                     // unique player identifier
//   x: number;                      // current X position
//   y: number;                      // current Y position
//   hasMoved: boolean;              // did the player already move this turn?
//   // stunned?: boolean;           // future-proof: player cannot act
// }

// export interface PlayerProgress {
//   collectedItems: string[];       // items collected
//   currentCollectibleId?: string;  // the next collectible to collect (multi only)
//   objectives: ObjectiveStatus[];  // per-objective progress
// }

// export interface Spectator {
//   id: string;
// }

// export interface GameRules {
//   mode: "SINGLE" | "MULTI";
//   maxPlayers: number;
//   allowSpectators: boolean;

//   collectiblesPerPlayer?: number;

//   requiresBoardActionPerTurn: boolean;
//   fixedCorners: boolean;
// }

// export interface GameState {
//   levelId: string;                    // which level is being played
//   level: Level;                       // level created for current game
//   phase: GamePhase;                   // tracks current turn phase

//   hostId?: string;                    // game owner (first player)
//   players: PlayerState[];             // all players
//   spectators: Spectator[];            // all spectators

//   rules: GameRules;                   // max players, mode so forth

//   board: Board;                       // board tiles
//   currentPlayerIndex: number;         // whose turn in players[]
//   currentPlayerId: string | null;     // convenience field
//   lastBoardAction?: BoardAction;      // last action performed
//   turnActions: {                      // per-turn counters
//     rotateCount: Record<string, number>;
//     shiftDone: boolean;
//     swapDone: boolean;
//   };

//   playerProgress: Record<string, PlayerProgress>; // per-player objectives and collected items
//   gameEnded: boolean;                 // has the game ended?
//   boardActionsPending: boolean;       // true until board action performed
//   collected: Record<string, boolean>; // globally collected items
//   gameResult?: {
//     winnerIds: string[];
//   };
// }
