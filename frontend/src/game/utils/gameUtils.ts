import { PlayerProgress } from "../models/privatState";

export function isPlayerProgress(value: unknown): value is PlayerProgress {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as PlayerProgress).objectives)
  );
}

export function isPlayerProgressMap(
  value: unknown,
): value is Record<string, PlayerProgress> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(isPlayerProgress);
}

export function resolveProgressState(params: {
  incomingPlayerProgress?: unknown;
  incomingPlayerProgressById?: unknown;
  previousPlayerProgress: PlayerProgress;
  previousPlayerProgressById?: Record<string, PlayerProgress>;
  currentUserId?: string | number;
}) {
  const {
    incomingPlayerProgress,
    incomingPlayerProgressById,
    previousPlayerProgress,
    previousPlayerProgressById,
    currentUserId,
  } = params;

  let nextPlayerProgress = previousPlayerProgress;
  let nextPlayerProgressById = previousPlayerProgressById;

  if (isPlayerProgressMap(incomingPlayerProgressById)) {
    nextPlayerProgressById = incomingPlayerProgressById;
  }

  if (isPlayerProgressMap(incomingPlayerProgress)) {
    nextPlayerProgressById = incomingPlayerProgress;
  } else if (isPlayerProgress(incomingPlayerProgress)) {
    nextPlayerProgress = incomingPlayerProgress;
  }

  if (currentUserId != null && nextPlayerProgressById) {
    const mine = nextPlayerProgressById[currentUserId.toString()];
    if (isPlayerProgress(mine)) {
      nextPlayerProgress = mine;
    }
  }

  return { nextPlayerProgress, nextPlayerProgressById };
}