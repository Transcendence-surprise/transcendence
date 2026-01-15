import { MultiGame } from "../models/gameInfo";

// Example: simplified board and level for testing
const sampleBoard = { width: 6, height: 6, tiles: [] }; // can be empty for now
const sampleLevel = { id: "puzzle-01", name: "First Level", board: sampleBoard, startingPoints: [], exitPoints: [], objectives: [], constraints: {}, collectibles: [] };

export function getFakeMultiplayerGames(count = 5): MultiGame[] {
  const list: MultiGame[] = [];

  for (let i = 1; i <= count; i++) {
    const maxPlayers = Math.floor(Math.random() * 3) + 2; // 2-4
    const joinedPlayers = Math.floor(Math.random() * maxPlayers) + 1;
    const phase = Math.random() > 0.5 ? "LOBBY" : "PLAY";

    list.push({
      id: `game-${i}`,
      hostId: `host-${i}`,
      phase,
      maxPlayers,
      joinedPlayers,
      allowSpectators: Math.random() > 0.5,
      collectiblesPerPlayer: Math.floor(Math.random() * 5) + 1,
    });
  }

  return list;
}