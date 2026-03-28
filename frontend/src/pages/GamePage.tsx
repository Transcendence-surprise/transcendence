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
    <div className="flex w-full h-full">
      
      {/* LEFT: Board */}
      <BoardView
        board={game.board}
        players={game.players}
        progress={game.playerProgress}
        gameId={gameId}
      />

      {/* RIGHT: Sidebar */}
      <Sidebar game={game} gameId={gameId} />

    </div>
  );
}