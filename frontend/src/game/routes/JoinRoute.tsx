// src/routes/MultiplayerJoinRoute.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMultiplayerGames, joinGame, checkPlayerAvailability } from "../../api/game";
import { MultiGame } from "../models/multiGames";
import JoinTable from "../../components/game/Join";
import { socket } from "../../services/socket";

export default function MultiplayerJoinRoute() {
  const navigate = useNavigate();
  const [games, setGames] = useState<MultiGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const secondUser = "user-3yaosz";   // optional second player   FAKE

  console.log("currentUserId from join:", secondUser);

  useEffect(() => {
    setLoading(true);
    getMultiplayerGames()
      .then((data) => setGames(data))
      .catch((err) => setError(err.message || "Failed to load games"))
      .finally(() => setLoading(false));

      socket.emit("joinMultiplayerList");

      socket.on("multiplayerListUpdate", (data) => {
        setGames(data.games);
      });

      return () => {
        socket.off("multiplayerListUpdate");
      };

  }, []);

  const handleJoin = async (gameId: string) => {
    try {
      setLoading(true);

      const availability = await checkPlayerAvailability(secondUser);

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

        const result = await joinGame(gameId, secondUser, "PLAYER");

        if (!result.ok) {
          setError(result.error || "Failed to join game");
          return;
        }

        navigate(`/multiplayer/lobby/${gameId}`, {
          state: { currentUserId: secondUser },
        });

      } catch (err: any) {
        setError(err.message || "Failed to join game");
      } finally {
        setLoading(false);
      }
    };

  const handleSpectate = (gameId: string) => {
    // await joinGame(gameId, currentUserId, "SPECTATOR");
    void navigate(`/game/${gameId}`);
  };

  if (loading) return <div>Loading multiplayer games...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Join Multiplayer Game</h2>
      <JoinTable
        games={games}
        onJoin={handleJoin}
        onSpectate={handleSpectate}
        onBack={() => navigate("/multiplayer/setup")}/>
    </div>
  );
}