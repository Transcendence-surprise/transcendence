import { rethrowAbortError } from "./requestUtils";

export async function checkHealth(signal?: AbortSignal): Promise<{ status: string }> {
  try {
    const res = await fetch('/api/health', { signal });
    if (!res.ok) throw new Error('Network error');
    return res.json();
  } catch (e: any) {
    rethrowAbortError(e);
  }
}
