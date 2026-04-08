// src/api/requestUtils.ts

export function rethrowAbortError(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  ) {
    throw error;
  }

  throw error;
}