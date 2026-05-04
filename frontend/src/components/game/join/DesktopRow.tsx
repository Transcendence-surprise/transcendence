import { MultiGame } from "../../../game/models/multiGames";
import InfoChip from "../../shared/InfoChip";
import GameAction from "./GameAction";

const desktopRowGridClass =
  "grid grid-cols-[1.3fr_1fr_0.6fr_1fr_1fr_90px] items-center justify-items-center text-center gap-4";
const desktopRowClass =
  `${desktopRowGridClass} border-b border-[var(--color-border-gray)] px-3 py-4 last:border-b-0`;
const phaseChipClass = "w-fit uppercase tracking-[0.12em]";

type DesktopRowProps = {
  game: MultiGame;
  actionButtonClass: string;
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
};

export default function DesktopRow({
  game,
  actionButtonClass,
  onJoin,
  onSpectate,
}: DesktopRowProps) {
  return (
    <div className={desktopRowClass}>
      <div className="break-words font-semibold text-white">
        {game.hostName}
      </div>

      <InfoChip className="w-fit whitespace-nowrap text-[11px]">
        {game.joinedPlayers} joined
      </InfoChip>

      <div className="text-sm text-white/90">
        {game.maxPlayers}
      </div>

      <InfoChip
        size="xs"
        variant={game.phase === "LOBBY" ? "cyan" : "muted"}
        className={phaseChipClass}
      >
        {game.phase}
      </InfoChip>

      {game.allowSpectators ? (
        <InfoChip size="xs" className="w-10 text-cyan-200">
          On
        </InfoChip>
      ) : (
        <InfoChip size="xs" variant="muted" className="w-10">
          Off
        </InfoChip>
      )}

      <GameAction
        game={game}
        actionButtonClass={actionButtonClass}
        onJoin={onJoin}
        onSpectate={onSpectate}
      />
    </div>
  );
}
