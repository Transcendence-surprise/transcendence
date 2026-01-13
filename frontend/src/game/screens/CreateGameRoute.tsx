// src/game/routes/CreateGameRoute.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameState, makeMove } from "../../api/game";
import Board from "../../components/game/Board";

export default function CreateGameRoute() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getGameState(id)
      .then(setGame)
      .catch((err) => {
        console.error("Failed to load game:", err);
        setError(err.message);
      });
  }, [id]);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!game) return <div>Loading game...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center space-y-4 p-4">
      <h2 className="text-2xl font-bold">Game {game.id}</h2>
      <Board board={game.board} />
      {/* later: add buttons / moves / actions */}
    </div>
  );
}
