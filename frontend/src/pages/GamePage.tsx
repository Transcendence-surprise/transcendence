// src/pages/GamePage.tsx
import BoardView from "../components/game/Board";
import Sidebar from "../components/game/GameSideBar";
import { PrivateGameState } from "../game/models/privatState";

type GamePageProps = {
  game: PrivateGameState;
  gameId: string;
  userId?: string | number;
};

export default function GamePage({ game, gameId, userId }: GamePageProps) {
  const isSpectator = userId != null && !game.players.some(
    (p) => p.id.toString() === userId.toString()
  );

  return (
    <div className="flex w-full h-full items-start justify-center">
      {/* Board centered */}
      <div className="flex-1 flex justify-center self-start">
        <BoardView
          board={game.board}
          players={game.players}
          currentPlayerId={game.currentPlayerId}
          gameId={gameId}
          isSpectator={isSpectator}
        />
      </div>
      {/* Sidebar pushed right */}
      <div className="flex-shrink-0 self-start">
        <Sidebar game={game} gameId={gameId} isSpectator={isSpectator} />
      </div>
    </div>
  );
}