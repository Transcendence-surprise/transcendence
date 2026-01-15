// src/routes/MultiplayerJoinRoute.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMultiplayerGames, joinGame } from "../../api/game";
import { MultiGame } from "../models/multiGames";
import JoinTable from "../../components/game/Join";

export default function MultiplayerJoinRoute() {
  const navigate = useNavigate();
  const [games, setGames] = useState<MultiGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMultiplayerGames()
      .then((data) => setGames(data))
      .catch((err) => setError(err.message || "Failed to load games"))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = (gameId: string) => {
    // temp user for now
    const userId = "user-" + Math.random().toString(36).substring(2, 8);
    // API join could go here: joinGame(gameId, userId)     // LOBBY CALLED HERE
    // For now just navigate to lobby
    void navigate(`/multiplayer/lobby/${gameId}`);
  };

  const handleSpectate = (gameId: string) => {
    void navigate(`/game/${gameId}`);
  };

  if (loading) return <div>Loading multiplayer games...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Join Multiplayer Game</h2>
      <JoinTable games={games} onJoin={handleJoin} onSpectate={handleSpectate} onBack={() => navigate("/multiplayer/setup")}/>
    </div>
  );
}