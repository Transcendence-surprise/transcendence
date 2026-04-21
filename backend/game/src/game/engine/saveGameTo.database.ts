// src/game/engine/helpers/saveGameToDB.ts

import { GameState } from "../models/state";
import { GamePersistenceService } from "../services/gamePersistence.service";
import { GamePhase } from "db-entities-dist/game/game.entity";

export async function saveGameToDB(
  gameId: string,
  state: GameState,
  persistence: GamePersistenceService,
) {
  await persistence.saveGame(gameId, state);
}