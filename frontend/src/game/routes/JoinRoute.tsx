// src/routes/MultiplayerJoinRoute.tsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMultiplayerGames, joinGame } from "../../api/game";
import { usePlayerAvailability } from "../../hooks/usePlayerAvailability";
import { MultiGame } from "../models/multiGames";
import JoinTable from "../../components/game/Join";
import { getRealtimeSocket } from "../../services/realtimeSocket";
import { useAuth } from "../../hooks/useAuth";

export default function MultiplayerJoinRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [games, setGames] = useState<MultiGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { availability } = usePlayerAvailability(user);

  const fetchGames = useCallback(async () => {
    try {
      const data = await getMultiplayerGames();
      setGames(data);
    } catch (e) {
      console.error("fetch failed:", e);
      setError("Failed to load games");
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    fetchGames().finally(() => setLoading(false));
  }, [user, fetchGames]);

  useEffect(() => {
    if (!user?.id) return;

    if (availability?.gameId) {
      if (availability.phase === "PLAY") {
        navigate(`/game/${availability.gameId}`);
      } else {
        navigate(`/multiplayer/lobby/${availability.gameId}`);
      }
    }
  }, [user, availability, navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = getRealtimeSocket();
    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

    socket.emit("joinMultiplayerList");

  const handleUpdate = () => {
    console.log("WS UPDATE RECEIVED");
    fetchGames();
  };

    socket.on("multiplayerGamesList:updated", handleUpdate);

    return () => {
      socket.off("multiplayerGamesList:updated", handleUpdate);
    };
  }, [user, fetchGames]);

  const handleJoin = async (gameId: string) => {
    const controller = new AbortController();
    try {
      setLoading(true);
      if (availability?.gameId) {
        if (availability.phase === "PLAY") {
          navigate(`/game/${availability.gameId}`);
        } else {
          navigate(`/multiplayer/lobby/${availability.gameId}`);
        }
        return;
      }

      await joinGame(gameId, "PLAYER", controller.signal);
      navigate(`/multiplayer/lobby/${gameId}`);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(err.message || "Failed to join game");
      }
    } finally {
      controller.abort();
      setLoading(false);
    }
  };

  const handleSpectate = async (gameId: string) => {
    const controller = new AbortController();
    try {
      setLoading(true);
      if (availability?.gameId) {
        if (availability.phase === "PLAY") {
          navigate(`/game/${availability.gameId}`);
        } else {
          navigate(`/multiplayer/lobby/${availability.gameId}`);
        }
        return;
      }
      await joinGame(gameId, "SPECTATOR", controller.signal);
      navigate(`/game/${gameId}`);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(err.message || "Failed to join as spectator");
      }
    } finally {
      controller.abort();
      setLoading(false);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <JoinTable
      games={games}
      onJoin={handleJoin}
      onSpectate={handleSpectate}
      onBack={() => navigate("/multiplayer/setup")}
      loading={loading}
    />
  );
}