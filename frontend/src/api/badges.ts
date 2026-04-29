// src/api/badges.ts

export interface Badge {
  id: number;
  key: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface UserBadge {
  key: string;
  name: string;
  description: string;
  imageUrl: string;
  progress: number;
  target: number;
  completed: boolean;
  unlockedAt: string | null; // ISO date string when the badge was unlocked
}

export async function getAllBadges(signal?: AbortSignal) {
  const response = await fetch('/api/badges', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch badges: ${response.statusText}`);
  }

  const data = await response.json();
  return data as Badge[];
}

export async function getUserBadges(signal?: AbortSignal) {
  const response = await fetch('/api/badges/user-badges', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user badges: ${response.statusText}`);
  }

  const data = await response.json();
  return data as UserBadge[];
}