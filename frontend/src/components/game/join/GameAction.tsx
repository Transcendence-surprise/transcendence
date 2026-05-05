import { MultiGame } from "../../../game/models/multiGames";
import { getLobbyGameStatus } from "./gameStatus";

type GameActionProps = {
  game: MultiGame;
  actionButtonClass: string;
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
};

export default function GameAction({
  game,
  actionButtonClass,
  onJoin,
  onSpectate,
}: GameActionProps) {
  const status = getLobbyGameStatus(game);

  if (status === "OPEN") {
    return (
      <button className={actionButtonClass} onClick={() => onJoin(game.id)}>
        Join
      </button>
    );
  }

  if (status === "LIVE") {
    return (
      <button className={actionButtonClass} onClick={() => onSpectate(game.id)}>
        Spectate
      </button>
    );
  }

  return <span className="text-sm text-gray-400">Full</span>;
}
