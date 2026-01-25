// // shows BoardPage or LobbyPage depending on phase

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameState } from "../../api/game";
import BoardView from "../../components/game/Board";
import { socket } from "../../services/socket";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getGameState(id)
      .then((g) => {
        setGame(g);

        // join play room
        socket.emit("joinPlay", { gameId: id, userId: "PLAYER_ID" });

        // listen for updates
        socket.on("playUpdate", (data) => {
          setGame((prev: any) => ({
            ...prev,
            ...data,
          }));
        });

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
      socket.off("error");
    };
  }, [id, navigate]);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  if (game.phase === "PLAY") {
    return (
      <BoardView
        board={game.board}
        players={game.players}
        progress={game.playerProgress}
      />
    );
  }

  return <div>Game ended</div>;
}
