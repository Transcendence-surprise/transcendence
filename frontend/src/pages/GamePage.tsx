// src/pages/GamePage.tsx
import BoardView from "../components/game/Board";
import Sidebar from "../components/game/GameSideBar";
import { PrivateGameState } from "../game/models/privatState";

type GamePageProps = {
  game: PrivateGameState;
  gameId: string;
};

export default function GamePage({ game, gameId }: GamePageProps) {
  return (
    <div className="flex w-full h-full items-center justify-center">
      {/* Board centered */}
      <div className="flex-1 flex justify-center">
        <BoardView
          board={game.board}
          players={game.players}
          gameId={gameId}
        />
      </div>
      {/* Sidebar pushed right */}
      <div className="flex-shrink-0">
        <Sidebar game={game} gameId={gameId} />
      </div>
    </div>
  );
}