import { COLLECTIBLE_IDS, Collectible } from "../models/collectible";

export function generateMultiplayerCollectibles(
  players: string[],
  collectiblesPerPlayer: number,
  boardSize: number
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
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize),
      });
    }
  }

  return result;
}
