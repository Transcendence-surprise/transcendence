import { useEffect, useState, useRef, useCallback } from "react";
import { getRealtimeSocket } from "../services/realtimeSocket";
import { checkPlayerAvailability } from "../api/game";

export interface PlayerAvailability {
  gameId?: string;
  phase?: string;
}

const MIN_INTERVAL_MS = 500;
let cachedAvailability: PlayerAvailability | null = null;
let cachedAt = 0;
let nextAllowedAt = 0;
let inFlight: Promise<PlayerAvailability | null> | null = null;

export function usePlayerAvailability(user: { id?: string | number } | null) {
  const [availability, setAvailability] = useState<PlayerAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<any>(null);

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const now = Date.now();
    if ((cachedAt && now - cachedAt < MIN_INTERVAL_MS) || now < nextAllowedAt) {
      setAvailability(cachedAvailability);
      setLoading(false);
      setHydrated(true);
      return;
    }

    if (inFlight) {
      const data = await inFlight;
      setAvailability(data);
      setLoading(false);
      setHydrated(true);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      inFlight = checkPlayerAvailability(controller.signal)
        .then((data) => {
          cachedAvailability = data?.gameId ? data : null;
          cachedAt = Date.now();
          nextAllowedAt = cachedAt + MIN_INTERVAL_MS;
          return cachedAvailability;
        })
        .catch((e: any) => {
          if (e?.name === "AbortError") {
            return cachedAvailability;
          }
          throw e;
        })
        .finally(() => {
          inFlight = null;
        });

      const data = await inFlight;
      setAvailability(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        if (e?.status === 429) {
          const retryAfterMs = Number(e?.retryAfterMs);
          if (!Number.isNaN(retryAfterMs) && retryAfterMs > 0) {
            nextAllowedAt = Date.now() + retryAfterMs;
          } else {
            nextAllowedAt = Date.now() + MIN_INTERVAL_MS;
          }
          setAvailability(cachedAvailability);
        } else {
          setError("Failed to load player status");
        }
      }
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAvailability(null);
      setLoading(false);
      setError(null);
      setHydrated(true);
      return;
    }

    const socket = getRealtimeSocket();
    if (!socket) return;

    // debounce wrapper (stable)
    const scheduleReload = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        load();
      }, 300);
    };

    setLoading(true);
    // initial load
    load();

    socket.on("playerAvailability:updated", scheduleReload);

    return () => {
      socket.off("playerAvailability:updated", scheduleReload);
      clearTimeout(debounceRef.current);
      controllerRef.current?.abort();
    };
  }, [user?.id, load]);

  return { availability, loading, error, hydrated };
}