// src/api/game.ts

import { SingleLevel } from "../game/models/singleLevel";
import { MultiGame } from "../game/models/multiGames";
import { BoardAction } from "../game/models/boardAction";
import { PrivateGameState } from "../game/models/privatState";
import { PlayerAction } from "../game/models/playerAction";

export type GameSettings =
  | ({ mode: 'SINGLE'; allowSpectators?: false; levelId?: string })
  | ({ mode: 'MULTI'; maxPlayers: 2|3|4; allowSpectators: boolean; boardSize:6|7|8|9; collectiblesPerPlayer:number });

export type PlayerInfo = {
  id: string;
  x?: number;
  y?: number;
};

export async function createGame(settings: GameSettings) {
  try {
    const res = await fetch('/api/game/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.message || 'Failed to create game');
    }

    return data;
  } catch (e: any) {
    throw new Error(`Network error: ${e.message}`);
  }
}

export async function joinGame(
  gameId: string,
  role: "PLAYER" | "SPECTATOR" = "PLAYER"
) {
  try {
    const res = await fetch('/api/game/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, role }),
      credentials: 'include',
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || data?.message || 'Failed to join game');
    }

    return data;
  } catch (e: any) {
    throw new Error(`Network error: ${e.message}`);
  }
}

export async function startGame(gameId: string) {
  try {
    const res = await fetch('/api/game/start', {
      method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId }),
    credentials: 'include',
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || data?.message || 'Failed to start game');
    }

    return data;
  } catch (e: any) {
    throw new Error(`Network error: ${e.message}`);
  }
}

export async function boardModification(gameId: string, action: BoardAction) {
  try {
  const res = await fetch('/api/game/boardmove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, action }),
    credentials: 'include',
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch (e) {
    // Backend returned invalid JSON (e.g., rate limit or server error)
    return {
      ok: false,
      error: `Server error: ${res.status} ${res.statusText}`,
    };
  }

  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error: data?.error || data?.message || `Failed to perform board action: ${res.statusText}`,
    };
  }

  return data;
  } catch (e: any) {
    return { ok: false, error: `Network error: ${e.message}` };
  }
}

export async function playerMove(gameId: string, action: PlayerAction) {
  try {
    const res = await fetch('/api/game/playermove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, action }),
      credentials: 'include',
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch (e) {
      return { ok: false, error: `Server error: ${res.status} ${res.statusText}` };
    }

    if (!res.ok || !data.ok) {
      return { ok: false, error: data?.error || data?.message || `Failed to perform board action: ${res.statusText}` };
    }

    return data;
  } catch (e: any) {
    return { ok: false, error: `Network error: ${e.message}` };
  }
}

export async function getGameState(gameId: string): Promise<PrivateGameState> {
  try {
    const res = await fetch(`/api/game/${gameId}`, { credentials: 'include' });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || 'Game state missing');
    }

    if (!data.state) {
      throw new Error('Game state missing in response');
    }

    return data.state; // full game object
  } catch (e: any) {
    throw new Error(`Failed to load game state: ${e.message}`);
  }
}

export async function leaveGame(gameId: string ) {
  try {
    const res = await fetch('/api/game/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
      credentials: 'include',
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch (e) {
      // Backend returned invalid JSON
      return {
        ok: false,
        error: `Server error: ${res.status} ${res.statusText}`,
      };
    }

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data?.error || data?.message || `Failed to leave game: ${res.statusText}`,
      };
    }

    return data;
  } catch (e: any) {
    return { ok: false, error: `Network error: ${e.message}` };
  }
}

export async function getSingleLevels(): Promise<SingleLevel[]> {
  try {  
    const res = await fetch("/api/game/single/levels", { credentials: "include" });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("getSingleLevels error:", res.status, errorText);
      throw new Error(`Failed to load levels: ${res.status} ${errorText}`);
    }
    return res.json();
  } catch (e: any) {
    throw new Error(`Network error: ${e.message}`);
  }
}

export async function getMultiplayerGames(): Promise<MultiGame[]> {
  try {
    const res = await fetch("/api/game/multi/games", { credentials: 'include' });

    if (!res.ok) {
      throw new Error("Failed to load multiplayer games");
    }

    const data = await res.json();
    console.log("Multiplayer games:", data);

    return data;
  } catch (e: any) {
    throw new Error(`Network error: ${e.message}`);
  }
}

export async function checkPlayerAvailability(): Promise<{
  ok: boolean;
  gameId?: string;
  phase: string;
}> {
  try {
    const res = await fetch("/api/game/check-player", {
      method: "GET",
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error("Failed to check player availability");
    }

    return res.json();
  } catch (e: any) {
    throw new Error(`Network error: ${e.message}`);
  }
}
