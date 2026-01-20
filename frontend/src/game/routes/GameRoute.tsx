// // shows BoardPage or LobbyPage depending on phase

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameState } from "../../api/game";
import { startGame } from "../../api/game";
import BoardView from "../../components/game/Board";
import Lobby from "../../components/game/Lobby";
import { getCurrentUser } from "../utils/fakeUser";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getCurrentUser();

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

  const handleStart = async () => {
    if (!currentUser) return;

    try {
      await startGame(game.id, currentUser.id); // call backend to start
      navigate(`/game/${game.id}`);             // then go to board
    } catch (err: any) {
      console.error("Failed to start game:", err);
      alert(err.message || "Could not start game");
    }
  };

  if (game.phase === "LOBBY") {
    return (
      <Lobby
        game={game}
        currentUserId={currentUser?.id || "unknown"}
        onGameStarted={handleStart}
      />
    );
  }

  if (game.phase === "PLAY") {
    return <BoardView board={game.board} />;
  }

  return <div>Game ended</div>;
}
