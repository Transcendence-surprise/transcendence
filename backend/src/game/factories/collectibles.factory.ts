import { COLLECTIBLE_IDS, Collectible } from "../models/collectible";

export function generateMultiplayerCollectibles(
  players: string[],
  collectiblesPerPlayer: number
): Collectible[] {
  const totalNeeded = players.length * collectiblesPerPlayer;
  if (totalNeeded > COLLECTIBLE_IDS.length) {
    throw new Error("Not enough predefined collectible IDs for this game.");
  }

  const shuffledIds = [...COLLECTIBLE_IDS].sort(() => Math.random() - 0.5);

  const result: Collectible[] = [];
  let idIndex = 0;

  for (const playerId of players) {
    for (let i = 0; i < collectiblesPerPlayer; i++) {
      result.push({
        id: shuffledIds[idIndex++],
        ownerId: playerId,
        // x/y will be assigned later
      });
    }
  }

  return result;
}
