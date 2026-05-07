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
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);
  const lastFetchAtRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MIN_UPDATE_INTERVAL_MS = 300;
  const DEBOUNCE_MS = 150;

  useEffect(() => {
    if (!id || !user) return;

    const controller = new AbortController();

    const socket = socketRef.current ?? connectRealtimeSocket();
    socketRef.current = socket;

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

    const fetchLatest = async (gameId: string) => {
      if (inFlightRef.current) {
        pendingRef.current = true;
        return;
      }

      const now = Date.now();
      const sinceLast = now - lastFetchAtRef.current;
      if (sinceLast < MIN_UPDATE_INTERVAL_MS) {
        pendingRef.current = true;
        return;
      }

      inFlightRef.current = true;
      lastFetchAtRef.current = now;

      try {
        const updated = await getGameState(gameId, controller.signal);

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
        inFlightRef.current = false;
        if (pendingRef.current) {
          pendingRef.current = false;
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            fetchLatest(gameId);
          }, DEBOUNCE_MS);
        }
      }
    };

    const handleGameUpdated = async ({ gameId }: any) => {
      if (gameId !== id) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchLatest(gameId);
      }, DEBOUNCE_MS);
    };

    getGameState(id, controller.signal)
      .then((g) => {
        const initial = applyGameUpdate(g, g);
        setGame(initial);

        socket.emit("game:join", { gameId: id });
        socket.on("game:updated", handleGameUpdated);
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

    return () => {
      controller.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      socket.emit("game:leave", { gameId: id });
      socket.off("game:updated", handleGameUpdated);
    };
  }, [id, user]);

  return { game, setGame, loading, error };
}