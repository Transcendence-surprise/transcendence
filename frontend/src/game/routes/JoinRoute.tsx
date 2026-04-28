// src/routes/MultiplayerJoinRoute.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMultiplayerGames, joinGame, checkPlayerAvailability } from "../../api/game";
import { MultiGame } from "../models/multiGames";
import JoinTable from "../../components/game/Join";
import { getRealtimeSocket, connectRealtimeSocket } from "../../services/realtimeSocket";
import { useAuth } from "../../hooks/useAuth";

export default function MultiplayerJoinRoute() {
  const navigate = useNavigate();
  const [games, setGames] = useState<MultiGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();

    setLoading(true);
    getMultiplayerGames(controller.signal)
      .then((data) => setGames(data))
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err.message || "Failed to load games");
        }
      })
      .finally(() => setLoading(false));

    const socket = getRealtimeSocket();

    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

    socket.emit("joinMultiplayerList");

    const handleUpdate = (data: any) => {
      setGames(data.games);
    };

    socket.on("multiplayerListUpdate", handleUpdate);

    return () => {
      socket.off("multiplayerListUpdate", handleUpdate);
      controller.abort();
    };

  }, [user]);

  const handleJoin = async (gameId: string) => {
    const controller = new AbortController();
    try {
      setLoading(true);

      const availability = await checkPlayerAvailability(controller.signal);

      if (!availability.ok) {
        if (!availability.gameId) {
          setError("Player is busy but no game found.");
          return;
        }
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

  if (loading) return <div>Loading multiplayer games...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <JoinTable
      games={games}
      onJoin={handleJoin}
      onSpectate={handleSpectate}
      onBack={() => navigate("/multiplayer/setup")}
    />
  );
}