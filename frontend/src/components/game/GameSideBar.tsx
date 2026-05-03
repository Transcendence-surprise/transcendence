// src/components/game/GameSideBar.tsx
import TimerPanel from "./sidebar/TimerPanel";
import PlayerList from "./sidebar/PlayerList";
import PlayerPrivatePanel from "./sidebar/PlayerPrivatePanel";
import { PrivateGameState } from "../../game/models/privatState";
import InfoChip from "../shared/InfoChip";
import { getMockAvatarSrc } from "../../types/mockPlayer";

type GameSideBarProps = {
  game: PrivateGameState;
  isSpectator?: boolean;
};

export default function GameSideBar({
  game,
  isSpectator = false,
}: GameSideBarProps) {
  const isSingleMode = game.rules?.mode === "SINGLE";
  const currentPlayer = game.players.find(
    (player) => String(player.id) === String(game.currentPlayerId),
  );
  const currentProgress =
    currentPlayer != null
      ? game.playerProgressById?.[String(currentPlayer.id)]
      : undefined;
  const collectedCount =
    currentProgress?.collectedItems?.length ??
    game.playerProgress?.collectedItems?.length ??
    0;
  const maxMoves = game.level?.constraints?.maxMoves;
  return (
    <div className="flex w-[21.5rem] flex-col gap-3 p-3 xl:w-[22.5rem]">
      {isSingleMode ? (
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01))] px-3 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-light-cyan/65">
            Solo Run
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-white">
                {currentPlayer?.name ?? "Player"}
              </h3>
              <p className="mt-0.5 text-xs text-lightest-cyan/70">
                Level {game.levelId}
              </p>
            </div>
            <img
              src={currentPlayer?.avatarUrl || getMockAvatarSrc(`user-${currentPlayer?.id ?? "player"}`)}
              alt={currentPlayer?.name ?? "Player avatar"}
              className="h-11 w-11 shrink-0 rounded-full border border-cyan-400/25 bg-black/15 object-cover shadow-[0_0_0_2px_rgba(34,211,238,0.08)]"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <InfoChip>{collectedCount} Collected</InfoChip>
            <InfoChip variant="muted">
              {maxMoves != null
                ? `${currentPlayer?.totalMoves ?? 0}/${maxMoves} Moves`
                : `${currentPlayer?.totalMoves ?? 0} Moves`}
            </InfoChip>
          </div>
        </div>
      ) : null}

      <TimerPanel game={game} />

      {!isSingleMode ? (
        <PlayerList
          players={game.players}
          currentPlayerId={game.currentPlayerId}
          playerProgress={game.playerProgressById}
          collectiblesPerPlayer={5}
        />
      ) : null}

      {!isSpectator && <PlayerPrivatePanel game={game} />}
    </div>
  );
}
