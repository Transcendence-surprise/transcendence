// src/components/game/JoinOrCreateTable.tsx
import { MultiGame } from "../../game/models/multiGames";
import BackButton from "../shared/BackButton";
import InfoChip from "../shared/InfoChip";

type Props = {
  games: MultiGame[];
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
  onBack: () => void;
  loading: boolean;
};

export default function JoinTable({
  games,
  onJoin,
  onSpectate,
  onBack,
  loading,
}: Props) {
  const actionButtonClass =
    "inline-flex items-center justify-center rounded-lg border border-cyan-300/30 bg-button-cyan-bg px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-button-cyan-hover sm:px-4 sm:text-sm";

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
    <div className="flex min-h-screen items-start justify-center bg-bg-dark px-4 py-10 font-sans text-cyan-bright">
      <div className="relative w-full max-w-6xl">
        <div className="absolute -inset-1 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(92,144,246,0.14),transparent_32%)] blur-2xl" />

        <div className="relative rounded-[28px] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-5 py-8 shadow-dark-lg sm:px-8 sm:py-10">
          <div className="flex flex-col items-center gap-3 text-center">
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <InfoChip>{games.length} Open Matches</InfoChip>
            <InfoChip>{activeLobbies} Lobby Slots</InfoChip>
            <InfoChip variant="muted">{spectatableGames} Spectatable</InfoChip>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-bg-dark/70 p-3 sm:p-4">
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[1.3fr_1fr_0.6fr_1fr_1fr_90px] gap-4 border-b border-[var(--color-border-gray)] px-3 py-3 justify-items-center text-center text-xs uppercase tracking-[0.16em] text-light-cyan/80">
                <div>Host</div>
                <div>Players</div>
                <div>Max</div>
                <div>Phase</div>
                <div>Spectators</div>
                <div>Action</div>
              </div>

              {games.map((game) => (
                <div
                  key={game.id}
                  className="grid grid-cols-[1.3fr_1fr_0.6fr_1fr_1fr_90px] items-center justify-items-center text-center gap-4 border-b border-[var(--color-border-gray)] px-3 py-4 last:border-b-0"
                >
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
                    className="w-fit uppercase tracking-[0.12em]"
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
              ))}
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_0_24px_rgba(0,234,255,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-light-cyan/60">
                        Host
                      </p>

                      <h3 className="mt-1 break-words text-lg font-semibold text-white">
                        {game.hostName}
                      </h3>
                    </div>

                    <InfoChip
                      size="xs"
                      variant={game.phase === "LOBBY" ? "cyan" : "muted"}
                      className="shrink-0 uppercase tracking-[0.12em]"
                    >
                      {game.phase}
                    </InfoChip>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
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
                        {getGameStatus(game)}
                      </span>
                    </MobileStat>
                  </div>

                  <div className="mt-5">
                    <GameAction
                      game={game}
                      actionButtonClass={`${actionButtonClass} w-full`}
                      onJoin={onJoin}
                      onSpectate={onSpectate}
                    />
                  </div>
                </div>
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

type GameActionProps = {
  game: MultiGame;
  actionButtonClass: string;
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
};

function GameAction({
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

type MobileStatProps = {
  label: string;
  children: React.ReactNode;
};

function MobileStat({ label, children }: MobileStatProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/15 p-3">
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-light-cyan/60">
        {label}
      </p>
      {children}
    </div>
  );
}

function getGameStatus(game: MultiGame) {
  if (game.phase === "LOBBY" && game.joinedPlayers < game.maxPlayers) {
    return "Open";
  }

  if (game.phase === "PLAY" && game.allowSpectators) {
    return "Live";
  }

  return "Full";
}