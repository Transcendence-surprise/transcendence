// src/api/game.ts

import { SingleLevel } from "../game/models/singleLevel";

export type GameSettings =
  | ({ mode: 'SINGLE'; allowSpectators?: false; levelId?: string })
  | ({ mode: 'MULTI'; maxPlayers: 2|3|4; allowSpectators: boolean; boardSize:6|7|8|9; collectiblesPerPlayer:number });

export type PlayerInfo = {
  id: string;
  x?: number;
  y?: number;
};

export async function createGame(hostId: string, settings: GameSettings) {
  const res = await fetch('/game/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, settings }),
  });
  return res.json();
}

export async function joinGame(gameId: string, playerId: string) {
  const res = await fetch('/game/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, playerId }),
  });
  return res.json();
}

export async function startGame(gameId: string, hostId: string) {
  const res = await fetch('/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, hostId }),
  });
  return res.json();
}

export async function getGameState(gameId: string) {
  const res = await fetch(`/game/${gameId}`);
  return res.json();
}

export async function makeMove(
  gameId: string,
  playerId: string,
  boardAction?: any,
  moveAction?: any
) {
  const res = await fetch('/game/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, playerId, boardAction, moveAction }),
  });
  return res.json();
}

export async function leaveGame(gameId: string, playerId: string) {
  const res = await fetch('/game/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, playerId }),
  });
  return res.json();
}

export async function getSingleLevels(): Promise<SingleLevel[]> {
  const res = await fetch("/game/single/levels");

  if (!res.ok) {
    throw new Error("Failed to load levels");
  }
  console.log("Levels from backend:", res);
  return res.json();
}

