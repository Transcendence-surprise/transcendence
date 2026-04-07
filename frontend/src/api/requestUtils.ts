export function rethrowAbortError(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  ) {
    throw error;
  }

  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`Network error: ${message}`);
}