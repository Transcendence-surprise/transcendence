// // shows BoardPage or LobbyPage depending on phase

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { connectSocket } from "../../services/socket";
import { useAuth } from '../../hooks/useAuth';
import GamePage from "../../pages/GamePage";
import { PrivateGameState } from "../models/privatState";
import { getGameState } from "../../api/game";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("Game ID is required");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [game, setGame] = useState<PrivateGameState | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !user) return;

    const socket = connectSocket();

    setLoading(true);
    getGameState(id)
      .then((g) => {
        setGame(g);

    // join play room
    socket.emit("joinPlay", { gameId: id, userId: user.id });

    // listen for updates
    const handlePlayUpdate = (data: Partial<PrivateGameState>) => {
       setGame((prev) => {
        if (!prev) return prev;
        return { ...prev, ...data };
      });
    };
    socket.on("playUpdate", handlePlayUpdate);

    // Listen for game deleted
    const handleGameDeleted = (data: { gameId: string }) => {
      if (data.gameId === id) {
        alert("Game was deleted by host");
        navigate("/game");
      }
    };
    socket.on("gameDeleted", handleGameDeleted);

    // listen for errors
    socket.on("error", (err) => {
      setError(err.error || "Failed to join play");
    });
    })
    .catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load game")
    )
    .finally(() => setLoading(false));

    return () => {
      socket.off("playUpdate");
      socket.off("gameDeleted");
      socket.off("error");
    };
  }, [id, navigate]);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  if (game.phase === "PLAY") {
    return <GamePage game={game} gameId={id} />;
  }
  return <div>Game ended</div>;
}
