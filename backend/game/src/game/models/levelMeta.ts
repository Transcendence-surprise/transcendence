import { LevelObjective } from "./objective";
import { Collectible } from "./collectible";

export interface LevelMeta {
  id: string;
  name: string;

  objectives: LevelObjective[];
  constraints?: {
    maxMoves?: number;
    levelLimitSec?: number;
  };

  startingPoints: {
    slotId: string;
    x: number;
    y: number;
  }[];

  exitPoints?: {
    x: number;
    y: number;
  }[];
  
  collectibles?: Collectible[];

  description?: string;
}
