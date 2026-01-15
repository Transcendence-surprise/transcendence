// // shows BoardPage or LobbyPage depending on phase

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameState } from "../../api/game";
import Board from "../../components/game/Board";
// import Lobby from "../../components/Lobby";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getGameState(id)
      .then(setGame)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load game")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

//   if (game.phase === "LOBBY") {
//     return <Lobby game={game} />;
//   }

  if (game.phase === "PLAY") {
    return <Board board={game.board} />;
  }

  return <div>Game ended</div>;
}
