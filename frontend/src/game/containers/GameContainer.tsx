// src/containers/GameContainer.tsx

import { useNavigate } from "react-router-dom";
import { useGameRoom } from "../../hooks/useGameRoom";
import { useGameChat } from "../../hooks/useGameChat";
import GamePage from "../../pages/GamePage";

type Props = {
  gameId: string;
  user: any;
};

export default function GameContainer({ gameId, user }: Props) {
  const navigate = useNavigate();

  const { game, loading, error } = useGameRoom(gameId);
  const chat = useGameChat(gameId);

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  const rawResult = game.gameResult as
    | { winnerIds?: (string | number)[]; winnerId?: string | number }
    | undefined;

  const winnerIds =
    rawResult?.winnerIds?.map(String) ??
    (rawResult?.winnerId ? [String(rawResult.winnerId)] : []);

  const myId = String(user.id);

  const iWon = winnerIds.includes(myId);

  const winnerNames = game.players
    .filter((p) => winnerIds.includes(String(p.id)))
    .map((p) => p.name)
    .join(", ");

  const endReasonText =
    game.endReason === "LOSE_MAX_MOVES"
      ? "You lost: move limit reached."
      : game.endReason === "LOSE_TIME_LIMIT"
      ? "You lost: time limit reached."
      : null;

  const isEnded = game.phase === "END";

  return (
    <>
      <GamePage
        game={game}
        gameId={gameId}
        userId={user.id}
        messages={chat.messages}
        input={chat.input}
        setInput={chat.setInput}
        sendMessage={chat.sendMessage}
        showChat={game.players.length > 1}
      />

      {isEnded && (
        <GameEndModal
          iWon={iWon}
          winnerNames={winnerNames}
          endReasonText={endReasonText}
          onBack={() => navigate("/game")}
        />
      )}
    </>
  );
}

function GameEndModal({
  iWon,
  winnerNames,
  endReasonText,
  onBack,
}: {
  iWon: boolean;
  winnerNames: string;
  endReasonText: string | null;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-center">
          {iWon ? "🏆 You won!" : endReasonText ? "You lost" : "Game finished"}
        </h2>

        <p className="text-center text-gray-300 mb-6">
          {winnerNames
            ? `Winner: ${winnerNames}`
            : endReasonText ?? "No winner information"}
        </p>

        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}