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
  const isSpectator =
    userId != null &&
    !game.players.some((p) => p.id.toString() === userId.toString());

  return (
    <div>
      <div className="flex w-full h-full items-start justify-center gap-4">
        {/* Board centered */}
        <div className="flex-1 flex justify-center self-start">
          <BoardView
            board={game.board}
            players={game.players}
            currentPlayerId={game.currentPlayerId}
            gameId={gameId}
            boardActionsPending={game.boardActionsPending}
            isSpectator={isSpectator}
          />
        </div>
        {/* Sidebar pushed right */}
        <div className="flex-shrink-0 self-start">
          <Sidebar game={game} gameId={gameId} isSpectator={isSpectator} />
        </div>
      </div>
      {showChat && (
        <div className="mt-4 w-5/6 mx-auto">
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
