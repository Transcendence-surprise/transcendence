// src/api/leaderboard.ts

export async function getUserRanking(signal?: AbortSignal) {
  const response = await fetch('/api/leaderboard/user-ranking', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user ranking: ${response.statusText}`);
  }

  const data = await response.json();
  return data as number | null;
}
