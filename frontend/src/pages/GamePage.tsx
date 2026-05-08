// src/pages/GamePage.tsx
import BoardView from "../components/game/Board";
import Sidebar from "../components/game/GameSideBar";
import LobbyChat from "../components/game/LobbyChat";
import { PrivateGameState } from "../game/models/privatState";
import { LobbyMessage } from "../game/models/lobbyMessage";

type GamePageProps = {
  game: PrivateGameState;
  gameId: string;
  userId?: string | number;
  messages: LobbyMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  showChat?: boolean;
};

export default function GamePage({
  game,
  gameId,
  userId,
  messages,
  input,
  setInput,
  sendMessage,
  showChat = false,
}: GamePageProps) {
  if (!game) return <div>Game not found</div>;

  const isSpectator =
    userId != null &&
    !game.players.some((p) => String(p.id) === String(userId));

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex w-full flex-col items-center gap-4 xl:flex-row xl:items-start xl:justify-center">
        {/* Board centered */}
        <div className="flex w-full justify-center self-start xl:flex-1">
          <BoardView
            board={game.board}
            players={game.players}
            currentPlayerId={game.currentPlayerId}
            gameId={gameId}
            exitPoints={game.level?.exitPoints}
            boardActionsPending={game.boardActionsPending}
            isSpectator={isSpectator}
          />
        </div>

        <div className="w-full xl:w-auto xl:flex-shrink-0 xl:self-start">
          <Sidebar game={game} isSpectator={isSpectator} />
        </div>
      </div>

      {showChat && (
        <div className="mx-auto mt-4 w-full max-w-5xl px-4 xl:w-5/6 xl:px-0">
          <LobbyChat
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            title="Game Chat"
          />
        </div>
      )}
    </div>
  );
}
