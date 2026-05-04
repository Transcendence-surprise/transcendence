// src/components/game/JoinOrCreateTable.tsx
import { MultiGame } from "../../game/models/multiGames";
import BackButton from "../shared/BackButton";
import InfoChip from "../shared/InfoChip";
import DesktopHeader from "./join/DesktopHeader";
import DesktopRow from "./join/DesktopRow";
import MobileCard from "./join/MobileCard";

const actionButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-cyan-300/30 bg-button-cyan-bg px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-button-cyan-hover sm:px-4 sm:text-sm";
const pageShellClass =
  "flex min-h-screen items-start justify-center bg-bg-dark px-4 py-10 font-sans text-cyan-bright";
const pageFrameClass = "relative w-full max-w-6xl";
const pageGlowClass =
  "absolute -inset-1 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(92,144,246,0.14),transparent_32%)] blur-2xl";
const panelClass =
  "relative rounded-[28px] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-5 py-8 shadow-dark-lg sm:px-8 sm:py-10";
const panelHeaderClass = "flex flex-col items-center gap-3 text-center";
const statsStripClass =
  "mt-6 flex flex-wrap items-center justify-center gap-2";
const listShellClass =
  "mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-bg-dark/70 p-3 sm:p-4";

type Props = {
  games: MultiGame[];
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
  onBack: () => void;
  loading: boolean;
};

export default function JoinLobbyList({
  games,
  onJoin,
  onSpectate,
  onBack,
  loading,
}: Props) {
  const activeLobbies = games.filter((game) => game.phase === "LOBBY").length;
  const spectatableGames = games.filter(
    (game) => game.phase === "PLAY" && game.allowSpectators,
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4 py-10 font-sans text-white">
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-8 py-8 text-center shadow-dark-lg">
          <p className="text-xs uppercase tracking-[0.34em] text-light-cyan/70">
            Lobby Browser
          </p>
          <p className="mt-3 text-lg font-semibold text-cyan-bright">
            Loading multiplayer games...
          </p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4 py-10 font-sans text-cyan-bright">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-1 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(92,144,246,0.14),transparent_32%)] blur-2xl" />

          <div className="relative rounded-[28px] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-8 py-10 text-center shadow-dark-lg">
            <p className="text-xs uppercase tracking-[0.34em] text-light-cyan/70">
              Lobby Browser
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              No Active Games
            </h2>

            <p className="mt-3 text-sm leading-6 text-lightest-cyan/80">
              Start a new lobby or try again later.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <InfoChip>0 Open Matches</InfoChip>
              <InfoChip variant="muted">Create or refresh</InfoChip>
            </div>

            <p className="mx-auto mt-4 max-w-md text-xs uppercase tracking-[0.16em] text-white/35">
              Ask a friend to host a lobby, or create one from the multiplayer
              setup screen.
            </p>

            <BackButton onClick={onBack} className="mt-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShellClass}>
      <div className={pageFrameClass}>
        <div className={pageGlowClass} />

        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <p className="text-xs uppercase tracking-[0.34em] text-light-cyan/70">
              Lobby Browser
            </p>

            <h2 className="text-3xl font-bold text-white drop-shadow-lg sm:text-5xl">
              Join Multiplayer Game
            </h2>

            <p className="max-w-2xl text-sm leading-6 text-lightest-cyan/80 sm:text-base">
              Pick a lobby to join or spectate.
            </p>
          </div>

          <div className={statsStripClass}>
            <InfoChip>{games.length} Open Matches</InfoChip>
            <InfoChip>{activeLobbies} Lobby Slots</InfoChip>
            <InfoChip variant="muted">{spectatableGames} Spectatable</InfoChip>
          </div>

          <div className={listShellClass}>
            {/* Desktop table */}
            <div className="hidden md:block">
              <DesktopHeader />
              {games.map((game) => (
                <DesktopRow
                  key={game.id}
                  game={game}
                  actionButtonClass={actionButtonClass}
                  onJoin={onJoin}
                  onSpectate={onSpectate}
                />
              ))}
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {games.map((game) => (
                <MobileCard
                  key={game.id}
                  game={game}
                  statusLabel={getMobileGameStatus(game)}
                  actionButtonClass={`${actionButtonClass} w-full`}
                  onJoin={onJoin}
                  onSpectate={onSpectate}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <BackButton onClick={onBack} className="mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getMobileGameStatus(game: MultiGame) {
  if (game.phase === "LOBBY" && game.joinedPlayers < game.maxPlayers) {
    return "Open";
  }

  if (game.phase === "PLAY" && game.allowSpectators) {
    return "Live";
  }

  return "Full";
}
