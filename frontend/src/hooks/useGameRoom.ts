// src/hooks/useGameRoom.ts

import { useEffect, useRef, useState } from "react";
import { connectRealtimeSocket } from "../services/realtimeSocket";
import { getGameState } from "../api/game";
import { PrivateGameState } from "../game/models/privatState";
import { resolveProgressState } from "../game/utils/gameUtils";
import { useAuth } from "./useAuth";

export function useGameRoom(id: string) {
  const { user } = useAuth();

  const [game, setGame] = useState<PrivateGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endRefetched = useRef(false);

  useEffect(() => {
    if (!id || !user) return;

    const controller = new AbortController();
    const socket = connectRealtimeSocket();

    // 🔥 IMPORTANT RESET (fixes your modal bug)
    setGame(null);
    setLoading(true);
    setError(null);
    endRefetched.current = false;

    const handleUpdate = (data: any) => {
      setGame((prev) => {
        if (!prev) return prev;

        const { nextPlayerProgress, nextPlayerProgressById } =
          resolveProgressState({
            incomingPlayerProgress: data.playerProgress,
            incomingPlayerProgressById: data.playerProgressById,
            previousPlayerProgress: prev.playerProgress,
            previousPlayerProgressById: prev.playerProgressById,
            currentUserId: user.id,
          });

        return {
          ...prev,
          ...data,
          playerProgress: nextPlayerProgress,
          playerProgressById: nextPlayerProgressById,
        };
      });
    };

    getGameState(id, controller.signal)
      .then((g) => {
        const { nextPlayerProgress, nextPlayerProgressById } =
          resolveProgressState({
            incomingPlayerProgress: g.playerProgress,
            incomingPlayerProgressById: g.playerProgressById,
            previousPlayerProgress: g.playerProgress,
            previousPlayerProgressById: g.playerProgressById,
            currentUserId: user.id,
          });

        setGame({
          ...g,
          playerProgress: nextPlayerProgress,
          playerProgressById: nextPlayerProgressById,
        });

        socket.emit("joinPlay", { gameId: id, userId: user.id });

        socket.on("playUpdate", handleUpdate);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setError("Failed to load game");
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
      socket.emit("leavePlay", { gameId: id });
      socket.off("playUpdate", handleUpdate);
    };
  }, [id, user]);

  return { game, setGame, loading, error };
}