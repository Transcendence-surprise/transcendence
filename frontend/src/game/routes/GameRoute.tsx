// // shows BoardPage or LobbyPage depending on phase

import { useParams, useNavigate } from "react-router-dom";
import GamePage from "../../pages/GamePage";
import { useGameRoom } from "../../hooks/useGameRoom";
import { useGameChat } from "../../hooks/useGameChat";
import { useAuth } from "../../hooks/useAuth";

export default function GameRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("Game ID is required");
 
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view the game</div>;
  }

  const navigate = useNavigate();

  const { game, loading, error } = useGameRoom(id);
  const chat = useGameChat(id);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  const rawResult = game.gameResult as
    | { winnerIds?: (string | number)[]; winnerId?: string | number }
    | undefined;

  const winnerIds =
    rawResult?.winnerIds?.map((id) => id.toString()) ??
    (rawResult?.winnerId ? [rawResult.winnerId.toString()] : []);

  const myId = user?.id?.toString();

  const iWon = !!myId && winnerIds.includes(myId);

  const winnerNames = game.players
    .filter((p) => winnerIds.includes(p.id.toString()))
    .map((p) => p.name)
    .join(", ");

  const endReasonText =
    game.endReason === "LOSE_MAX_MOVES"
      ? "You lost: move limit reached."
      : game.endReason === "LOSE_TIME_LIMIT"
      ? "You lost: time limit reached."
      : null;

  
  if (game.phase === "END") {
    return (
      <div className="relative">
        <GamePage
          game={game}
          gameId={id}
          userId={user.id}
          messages={chat.messages}
          input={chat.input}
          setInput={chat.setInput}
          sendMessage={chat.sendMessage}
          showChat={game.players.length > 1}
        />

        {/* modal stays same */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-center">
              {iWon
                ? "🏆 You won!"
                : endReasonText
                ? "You lost"
                : "Game finished"}
            </h2>

            <p className="text-center text-gray-300 mb-6">
              {winnerNames
                ? `Winner: ${winnerNames}`
                : endReasonText ?? "No winner information"}
            </p>

            <button
              onClick={() => navigate("/game")}
              className="mt-4 px-4 py-2 bg-blue-600"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GamePage
      game={game}
      gameId={id}
      userId={user.id}
      messages={chat.messages}
      input={chat.input}
      setInput={chat.setInput}
      sendMessage={chat.sendMessage}
      showChat={game.players.length > 1}
    />
  );
}
