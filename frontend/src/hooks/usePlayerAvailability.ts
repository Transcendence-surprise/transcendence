import { useEffect, useState, useRef, useCallback } from "react";
import { getRealtimeSocket } from "../services/realtimeSocket";
import { checkPlayerAvailability } from "../api/game";

export interface PlayerAvailability {
  gameId?: string;
  phase?: string;
}

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

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const data = await checkPlayerAvailability(controller.signal);
      setAvailability(data?.gameId ? data : null);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError("Failed to load player status");
      }
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAvailability(null);
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