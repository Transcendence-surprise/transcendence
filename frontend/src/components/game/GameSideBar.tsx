// src/components/game/GameSideBar.tsx
import TimerPanel from "./sidebar/TimerPanel";
import PlayerList from "./sidebar/PlayerList";
import PlayerPrivatePanel from "./sidebar/PlayerPrivatePanel";
import { PrivateGameState } from "../../game/models/privatState";

type GameSideBarProps = {
  game: PrivateGameState;
  gameId: string;
};

export default function GameSideBar({ game }: GameSideBarProps) {
  return (
    <div className="w-80 flex flex-col gap-4 p-4">

      <TimerPanel game={game} />

      <PlayerList
        players={game.players}
        currentPlayerId={game.currentPlayerId}
      />

      <PlayerPrivatePanel
        game={game}
      />

    </div>
  );
}