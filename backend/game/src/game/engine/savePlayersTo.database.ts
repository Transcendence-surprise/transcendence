// src/game/engine/helpers/savePlayersTo.database.ts

import { GameState } from "../models/state";
import { PlayersPersistenceService } from "../services/playersPersistence.service";

export async function savePlayersToDB(
  gameId: string,
  state: GameState,
  persistence: PlayersPersistenceService,
) {
  console.log(`Saving players for game ${gameId} to database...`);
  await persistence.savePlayer(gameId, state);
  console.log(`Players for game ${gameId} saved to database.`);
}