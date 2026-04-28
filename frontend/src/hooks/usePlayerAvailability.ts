import { useEffect, useState, useRef } from "react";
import { getRealtimeSocket } from "../services/realtimeSocket";
import { checkPlayerAvailability } from "../api/game";

export interface PlayerAvailability {
  gameId?: string;
  phase?: string;
}

export function usePlayerAvailability(user: { id?: string } | null) {
  const [availability, setAvailability] = useState<PlayerAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setAvailability(null);
      setError(null);
      setLoading(false);
      return;
    }

    const socket = getRealtimeSocket();

    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

    // abort previous request if any
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    const loadStatus = async () => {
      if (inFlightRef.current) return; // prevent spam
      inFlightRef.current = true;

      setLoading(true);
      setError(null);

      try {
        const data = await checkPlayerAvailability(controller.signal);

        if (data?.gameId) {
          setAvailability({
            gameId: data.gameId,
            phase: data.phase,
          });
        } else {
          setAvailability(null);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError("Failed to load player status");
        }
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    };

    // Initial load (ONLY ONCE per mount)
    loadStatus();

    // Socket-driven refresh
    const handleUpdate = () => {
      loadStatus();
    };

    socket.on("playerAvailability:updated", handleUpdate);

    return () => {
      controller.abort();
      socket.off("playerAvailability:updated", handleUpdate);
    };
  }, [user]);

  return { availability, loading, error };
}