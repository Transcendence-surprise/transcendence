import { Board } from "./board";
import { LevelObjective } from "./objective";
import { Collectible } from "./collectible";

export type GameMode = "SINGLE" | "MULTI";

export interface Level {
  id: string;
  name?: string;

  board: Board;

  startingPoints: {
    slotId: string;
    x: number;
    y: number;
  }[];

  exitPoints?: {
    x: number;
    y: number;
  }[];

  objectives: LevelObjective[];
  collectibles?: Collectible[];

  constraints?: {
    maxMoves?: number;
    timeLimitSec?: number;
  };

  // allowedCards?: string[];
}
