export async function checkHealth(): Promise<{ status: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Network error');
    return res.json();
  } catch {
    return { status: 'error' };
  }
}
