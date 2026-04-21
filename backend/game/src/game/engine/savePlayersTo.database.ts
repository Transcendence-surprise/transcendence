// src/game/engine/helpers/savePlayersTo.database.ts

import { GameState } from "../models/state";
import { PlayersPersistenceService } from "../services/playersPersistence.service";

export async function savePlayersToDB(
  gameId: string,
  state: GameState,
  persistence: PlayersPersistenceService,
) {
  await persistence.savePlayer(gameId, state);
}