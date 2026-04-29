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

  const socketRef = useRef<any>(null);
  const isFetching = useRef(false);

  useEffect(() => {
    if (!id || !user) return;

    const controller = new AbortController();

    if (!socketRef.current) {
      socketRef.current = connectRealtimeSocket();
    }
    const socket = socketRef.current;

    setGame(null);
    setLoading(true);
    setError(null);

    const applyGameUpdate = (updated: any, prev: PrivateGameState) => {
      const { nextPlayerProgress, nextPlayerProgressById } =
        resolveProgressState({
          incomingPlayerProgress: updated.playerProgress,
          incomingPlayerProgressById: updated.playerProgressById,
          previousPlayerProgress: prev.playerProgress,
          previousPlayerProgressById: prev.playerProgressById,
          currentUserId: user.id,
        });

      return {
        ...updated,
        playerProgress: nextPlayerProgress,
        playerProgressById: nextPlayerProgressById,
      };
    };

    const handleUpdate = async ({ gameId }: any) => {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        const updated = await getGameState(gameId);

        setGame((prev) => {
          if (!prev) return prev;
          return applyGameUpdate(updated, prev);
        });
      } catch (e: any) {
        if (
          e?.message === "GAME_NOT_FOUND" ||
          e?.message === "Game state missing"
        ) {
          setError("Game not found or has ended.");
          setGame(null);
        } else if (e?.name !== "AbortError") {
          setError("Failed to load game");
        }
      } finally {
        isFetching.current = false;
      }
    };

    getGameState(id, controller.signal)
      .then((g) => {
        const initial = applyGameUpdate(g, g);
        setGame(initial);

        socket.emit("game:join", { gameId: id });
        socket.on("game:updated", handleUpdate);
      })
      .catch((e) => {
        if (
          e?.message === "GAME_NOT_FOUND" ||
          e?.message === "Game state missing"
        ) {
          setError("Game not found or has ended.");
          setGame(null);
        } else if (e?.name !== "AbortError") {
          setError("Failed to load game");
        }
      })
      .finally(() => setLoading(false));

    // ✅ cleanup (now works correctly)
    return () => {
      controller.abort();
      socket.emit("game:leave", { gameId: id });
      socket.off("game:updated", handleUpdate);
    };
  }, [id, user]);

  return { game, setGame, loading, error };
}