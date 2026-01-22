// // shows BoardPage or LobbyPage depending on phase

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameState } from "../../api/game";
import BoardView from "../../components/game/Board";

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

        // If game is not PLAY, redirect to join table
        if (g.phase !== "PLAY") {
          navigate("/multiplayer/join");
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load game")
      )
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  if (game.phase === "PLAY") {
    return <BoardView board={game.board} />;
  }

  return <div>Game ended</div>;
}
