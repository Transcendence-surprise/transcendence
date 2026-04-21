// src/api/matches.ts

export interface LatestGames {
  result: string;
  opponents: string [];
  createdAt: string;
}

export async function getUserLatestGames(signal?: AbortSignal) {
  const response = await fetch('/api/matches/latest', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user latest games: ${response.statusText}`);
  }
  const data = await response.json();
  return data as LatestGames[] | null;
}