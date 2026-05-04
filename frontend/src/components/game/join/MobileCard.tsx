import { MultiGame } from "../../../game/models/multiGames";
import InfoChip from "../../shared/InfoChip";
import GameAction from "./GameAction";
import MobileStat from "./MobileStat";

const mobileCardClass =
  "rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_0_24px_rgba(0,234,255,0.05)]";
const mobileHeaderClass = "flex items-start justify-between gap-3";
const mobileTitleClass =
  "text-[10px] uppercase tracking-[0.18em] text-light-cyan/60";
const mobilePhaseChipClass = "shrink-0 uppercase tracking-[0.12em]";
const mobileStatsGridClass = "mt-4 grid grid-cols-2 gap-3";

type MobileCardProps = {
  game: MultiGame;
  actionButtonClass: string;
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
  statusLabel: string;
};

export default function MobileCard({
  game,
  actionButtonClass,
  onJoin,
  onSpectate,
  statusLabel,
}: MobileCardProps) {
  return (
    <div className={mobileCardClass}>
      <div className={mobileHeaderClass}>
        <div className="min-w-0">
          <p className={mobileTitleClass}>
            Host
          </p>

          <h3 className="mt-1 break-words text-lg font-semibold text-white">
            {game.hostName}
          </h3>
        </div>

        <InfoChip
          size="xs"
          variant={game.phase === "LOBBY" ? "cyan" : "muted"}
          className={mobilePhaseChipClass}
        >
          {game.phase}
        </InfoChip>
      </div>

      <div className={mobileStatsGridClass}>
        <MobileStat label="Players">
          <InfoChip className="w-fit text-[11px]">
            {game.joinedPlayers} joined
          </InfoChip>
        </MobileStat>

        <MobileStat label="Max">
          <span className="text-sm font-medium text-white/90">
            {game.maxPlayers}
          </span>
        </MobileStat>

        <MobileStat label="Spectators">
          {game.allowSpectators ? (
            <InfoChip size="xs" className="w-fit text-cyan-200">
              Allowed
            </InfoChip>
          ) : (
            <InfoChip size="xs" variant="muted" className="w-fit">
              Off
            </InfoChip>
          )}
        </MobileStat>

        <MobileStat label="Status">
          <span className="text-sm text-white/70">
            {statusLabel}
          </span>
        </MobileStat>
      </div>

      <div className="mt-5">
        <GameAction
          game={game}
          actionButtonClass={actionButtonClass}
          onJoin={onJoin}
          onSpectate={onSpectate}
        />
      </div>
    </div>
  );
}
