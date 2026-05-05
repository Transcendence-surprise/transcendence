// src/containers/GameContainer.tsx

import { useNavigate } from "react-router-dom";
import GameEndModal from "../../components/game/GameEndModal";
import { useGameRoom } from "../../hooks/useGameRoom";
import GamePage from "../../pages/GamePage";
import { useGameMessages } from "../../hooks/useGameMessages";
import { useUsersMap } from "../../hooks/useUsersMap";
import { useState } from "react";
import { getRealtimeSocket } from "../../services/realtimeSocket";

type Props = {
  gameId: string;
  user: any;
};

export default function GameContainer({ gameId, user }: Props) {
  const navigate = useNavigate();

  const { game, loading, error } = useGameRoom(gameId);

  const { userByUsername } = useUsersMap(user);
  const [input, setInput] = useState("");

  const { messages } = useGameMessages(
    gameId,
    userByUsername,
  );

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
  const hasWinner = winnerIds.length > 0;
  const didLose = !iWon && (Boolean(endReasonText) || hasWinner);
  const modalVariant = iWon ? "victory" : didLose ? "defeat" : "neutral";
  const modalBadgeLabel = iWon ? "Victory" : didLose ? "Defeat" : "Complete";
  const modalTitle = iWon ? "You won!" : didLose ? "You lose!" : "Draw";
  const modalWinnerText = winnerNames ? `Winner: ${winnerNames}` : null;

  const sendMessage = () => {
    if (!input.trim() || !gameId) return;

    const socket = getRealtimeSocket(); // get the existing socket instance
    if (!socket || !input.trim() || !gameId) return;

    socket.emit("lobbyMessage", {
      gameId,
      message: input,
    });

    setInput("");
  };

  return (
    <>
      <GamePage
        game={game}
        gameId={gameId}
        userId={user.id}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        showChat={game.players.length > 1}
      />

      {isEnded && (
        <GameEndModal
          variant={modalVariant}
          badgeLabel={modalBadgeLabel}
          title={modalTitle}
          winnerText={modalWinnerText}
          onBack={() => navigate("/game")}
        />
      )}
    </>
  );
}
