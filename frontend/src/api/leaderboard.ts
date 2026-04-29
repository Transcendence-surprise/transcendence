// src/api/leaderboard.ts

export interface LeaderboardEntry {
  userId: number;
  username: string | null;
  winStreak: number;
  wins: number;
  totalGames: number;
  rank: number;
  avatarUrl: string | null;
}

export async function getAllTimeLeaderboard(
  signal?: AbortSignal,
): Promise<LeaderboardEntry[]> {
  const response = await fetch("/api/leaderboard/all-time", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }

  const data = await response.json();
  return data as LeaderboardEntry[];
}

export async function getUserRanking(signal?: AbortSignal) {
  const response = await fetch("/api/leaderboard/user-ranking", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user ranking: ${response.statusText}`);
  }

  const data = await response.json();
  return data as number | null;
}
