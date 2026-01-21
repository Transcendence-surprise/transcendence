// src/api/game.ts

import { SingleLevel } from "../game/models/singleLevel";
import { MultiGame } from "../game/models/multiGames";

export type GameSettings =
  | ({ mode: 'SINGLE'; allowSpectators?: false; levelId?: string })
  | ({ mode: 'MULTI'; maxPlayers: 2|3|4; allowSpectators: boolean; boardSize:6|7|8|9; collectiblesPerPlayer:number });

export type PlayerInfo = {
  id: string;
  x?: number;
  y?: number;
};

export async function createGame(hostId: string, settings: GameSettings) {
  const res = await fetch('/api/game/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, settings }),
  });
  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data?.message || 'Failed to create game');
  }

  return data; // { ok: true, gameId: string }
}

export async function joinGame(
  gameId: string,
  playerId: string,
  role: "PLAYER" | "SPECTATOR" = "PLAYER"
) {
  const res = await fetch('/api/game/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, playerId, role }),
  });
  return res.json();
}

export async function startGame(gameId: string, hostId: string) {
  const res = await fetch('/api/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, hostId }),
  });
  return res.json();
}

export async function getGameState(gameId: string) {
  const res = await fetch(`/api/game/${gameId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch game state');
  }

  return data; // full game object
}

// export async function makeMove(
//   gameId: string,
//   playerId: string,
//   boardAction?: any,
//   moveAction?: any
// ) {
//   const res = await fetch('api/game/move', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ gameId, playerId, boardAction, moveAction }),
//   });
//   return res.json();
// }

export async function leaveGame(gameId: string, playerId: string) {
  const res = await fetch('/api/game/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, playerId }),
  });
  return res.json();
}

export async function getSingleLevels(): Promise<SingleLevel[]> {
  const res = await fetch("/api/game/single/levels");

  if (!res.ok) {
    throw new Error("Failed to load levels");
  }
  console.log("Levels from backend:", res);
  return res.json();
}

export async function getMultiplayerGames(): Promise<MultiGame[]> {
  const res = await fetch("/api/game/multi/games");

  if (!res.ok) {
    throw new Error("Failed to load multiplayer games");
  }

  const data = await res.json();
  console.log("Multiplayer games:", data);

  return data;
}

export async function checkPlayerAvailability(playerId: string): Promise<{
  ok: boolean;
  gameId?: string;
  phase: string;
}> {

  const res = await fetch("/api/game/check-player/:playerId");

  if (!res.ok) {
    throw new Error("Failed to check player availability");
  }

  return res.json();
}
