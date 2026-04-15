import { rethrowAbortError } from "./requestUtils";

export async function checkHealth(
  signal?: AbortSignal,
): Promise<{ status: string }> {
  try {
    const res = await fetch("/api/health", { signal });
    if (!res.ok) throw new Error("Network error");
    return res.json();
  } catch (e: any) {
    rethrowAbortError(e);
    throw e;
  }
}

export interface ServiceHealth {
  name: string;
  endpoint: string;
  status: "ok" | "error" | "loading";
  error?: string;
  lastCheck?: Date;
}

/**
 * Check health of all microservices
 */
export async function checkAllServicesHealth(
  signal?: AbortSignal,
): Promise<ServiceHealth[]> {
  // In dev mode, services are on different ports
  // In production (docker), they're accessed through the gateway
  const isDev = import.meta.env.DEV;

  const services = isDev
    ? [
        { name: "Gateway Service", endpoint: "http://localhost:3002/api/health" },
        {
          name: "Auth Service",
          endpoint: "http://localhost:3001/api/auth/health",
        },
        {
          name: "Core Service",
          endpoint: "http://localhost:3000/api/core/health",
        },
        {
          name: "Game Service",
          endpoint: "http://localhost:3003/api/game/health",
        },
      ]
    : [
        { name: "Gateway Service", endpoint: "/api/health" },
        { name: "Auth Service", endpoint: "/api/auth/health" },
        { name: "Core Service", endpoint: "/api/core/health" },
        { name: "Game Service", endpoint: "/api/game/health" },
      ];

  const results: ServiceHealth[] = services.map((s) => ({
    name: s.name,
    endpoint: s.endpoint,
    status: "loading",
  }));

  const healthChecks = services.map(async (service, index) => {
    try {
      const res = await fetch(service.endpoint, {
        signal,
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        results[index] = {
          name: service.name,
          endpoint: service.endpoint,
          status: "ok",
          lastCheck: new Date(),
        };
      } else {
        results[index] = {
          name: service.name,
          endpoint: service.endpoint,
          status: "error",
          error: `HTTP ${res.status}`,
          lastCheck: new Date(),
        };
      }
    } catch (err: any) {
      rethrowAbortError(err);

      results[index] = {
        name: service.name,
        endpoint: service.endpoint,
        status: "error",
        error: err?.message || "Connection failed",
        lastCheck: new Date(),
      };
    }
  });

  await Promise.all(healthChecks);
  return results;
}