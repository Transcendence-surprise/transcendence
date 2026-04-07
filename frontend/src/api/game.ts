// src/api/game.ts

import { SingleLevel } from "../game/models/singleLevel";
import { MultiGame } from "../game/models/multiGames";
import { BoardAction } from "../game/models/boardAction";
import { PrivateGameState } from "../game/models/privatState";
import { PlayerAction } from "../game/models/playerAction";
import { rethrowAbortError } from "./requestUtils";

export type GameSettings =
  | ({ mode: 'SINGLE'; allowSpectators?: false; levelId?: string })
  | ({ mode: 'MULTI'; maxPlayers: 2|3|4; allowSpectators: boolean; boardSize:6|7|8|9; collectiblesPerPlayer:number });

export type PlayerInfo = {
  id: string;
  x?: number;
  y?: number;
};

export async function createGame(settings: GameSettings, signal?: AbortSignal) {
  try {
    const res = await fetch('/api/game/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
      credentials: 'include',
      signal,
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.message || 'Failed to create game');
    }

    return data;
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}

export async function joinGame(
  gameId: string,
  role: "PLAYER" | "SPECTATOR" = "PLAYER",
  signal?: AbortSignal,
) {
  try {
    const res = await fetch('/api/game/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, role }),
      credentials: 'include',
      signal,
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || data?.message || 'Failed to join game');
    }

    return data;
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}

export async function startGame(gameId: string, signal?: AbortSignal) {
  try {
    const res = await fetch('/api/game/start', {
      method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId }),
    credentials: 'include',
    signal,
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      console.error("Start game error:", res.status, data);
      throw new Error(data?.error || data?.message || 'Failed to start game');
    }

    return data;
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}

export async function boardModification(gameId: string, action: BoardAction, signal?: AbortSignal) {
  try {
  const res = await fetch('/api/game/boardmove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, action }),
    credentials: 'include',
    signal,
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch (e) {
    // Backend returned invalid JSON
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }

  if (!res.ok || !data.ok) {
      throw new Error(data?.error || data?.message || `Failed to perform board action: ${res.statusText}`);
  }

  return data;
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}

export async function playerMove(gameId: string, path: { x: number; y: number }[], skip?: boolean, signal?: AbortSignal) {
  try {
    const res = await fetch('/api/game/playermove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ gameId, path }),
      credentials: 'include',
      signal,
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || data?.message || `Failed to perform player action: ${res.statusText}`);
    }

    return data;
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}

export async function getGameState(gameId: string, signal?: AbortSignal): Promise<PrivateGameState> {
  try {
    const res = await fetch(`/api/game/${gameId}`, { credentials: 'include', signal });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || 'Game state missing');
    }

    if (!data.state) {
      throw new Error('Game state missing in response');
    }

    return data.state; // full game object
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}

export async function leaveGame(gameId: string, signal?: AbortSignal ) {
  try {
    const res = await fetch('/api/game/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
      credentials: 'include',
      signal,
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch (e) {
      // Backend returned invalid JSON
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || data?.message || `Failed to leave game: ${res.statusText}`);
    }

    return data;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function getSingleLevels(signal?: AbortSignal): Promise<SingleLevel[]> {
  try {  
    const res = await fetch("/api/game/single/levels", { credentials: "include", signal });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("getSingleLevels error:", res.status, errorText);
      throw new Error(`Failed to load levels: ${res.status} ${errorText}`);
    }
    return res.json();
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function getMultiplayerGames(signal?: AbortSignal): Promise<MultiGame[]> {
  try {
    const res = await fetch("/api/game/multi/games", { credentials: 'include', signal });

    if (!res.ok) {
      throw new Error("Failed to load multiplayer games");
    }

    const data = await res.json();
    console.log("Multiplayer games:", data);

    return data;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function checkPlayerAvailability(signal?: AbortSignal): Promise<{
  ok: boolean;
  gameId?: string;
  phase: string;
}> {
  try {
    const res = await fetch("/api/game/check-player", {
      method: "GET",
      credentials: 'include',
      signal,
    });

    if (!res.ok) {
      throw new Error("Failed to check player availability");
    }

    return res.json();
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}
