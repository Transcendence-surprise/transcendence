import { MultiGame } from "../../../game/models/multiGames";

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
  if (game.phase === "LOBBY" && game.joinedPlayers < game.maxPlayers) {
    return (
      <button className={actionButtonClass} onClick={() => onJoin(game.id)}>
        Join
      </button>
    );
  }

  if (game.phase === "PLAY" && game.allowSpectators) {
    return (
      <button className={actionButtonClass} onClick={() => onSpectate(game.id)}>
        Spectate
      </button>
    );
  }

  return <span className="text-sm text-gray-400">Full</span>;
}
