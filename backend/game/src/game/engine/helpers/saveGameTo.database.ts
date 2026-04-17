// src/game/engine/helpers/saveGameToDB.ts

import { GameState } from "../../models/state";
import { GamePersistenceService } from "../../services/gamePersistence.service";
import { GamePhase } from "db-entities-dist/game/game.entity";

export async function saveGameToDB(
  gameId: string,
  state: GameState,
  persistence: GamePersistenceService,
) {
  if (state.phase === GamePhase.END) {
    console.log(`Saving finished game ${gameId} with result:`, state.gameResult);
  } else {
    console.log(`Saving game ${gameId} in phase ${state.phase}...`);
  }

  await persistence.saveGame(gameId, state);

  if (state.phase === GamePhase.END) {
    console.log(`Game ${gameId} finalized and saved to database.`);
  } else {
    console.log(`Game ${gameId} saved to database.`);
  }
}