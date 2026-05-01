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
    "rounded-lg border border-cyan-300/30 bg-button-cyan-bg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-button-cyan-hover";
  const tableHeadClass =
    "border-b border-[var(--color-border-gray)] px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-light-cyan/80";
  const tableCellClass =
    "border-b border-[var(--color-border-gray)] px-4 py-4 text-sm text-white/90";
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

        <div className="relative rounded-[28px] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-6 py-8 shadow-dark-lg sm:px-8 sm:py-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-light-cyan/70">
              Lobby Browser
            </p>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">
              Join Multiplayer Game
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-lightest-cyan/80 sm:text-base">
              Pick a lobby to join or spectate.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <InfoChip>{games.length} Open Matches</InfoChip>
            <InfoChip>{activeLobbies} Lobby Slots</InfoChip>
            <InfoChip variant="muted">
              {spectatableGames} Spectatable
            </InfoChip>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-border-subtle)] bg-bg-dark/70">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
              <thead className="bg-bg-dark/90">
                <tr>
                  <th className={tableHeadClass}>Host</th>
                  <th className={tableHeadClass}>Players</th>
                  <th className={tableHeadClass}>Max</th>
                  <th className={tableHeadClass}>Phase</th>
                  <th className={tableHeadClass}>Spectators</th>
                  <th className={tableHeadClass}>Action</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr
                    key={game.id}
                    className="odd:bg-white/[0.02] even:bg-transparent"
                  >
                    <td className={tableCellClass}>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{game.hostName}</span>
                        <span className="text-xs text-white/40">Game ID: {game.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className={tableCellClass}>
                      <InfoChip className="text-[11px]">
                        {game.joinedPlayers} joined
                      </InfoChip>
                    </td>
                    <td className={tableCellClass}>{game.maxPlayers}</td>
                    <td className={tableCellClass}>
                      <InfoChip
                        size="xs"
                        variant={game.phase === "LOBBY" ? "cyan" : "muted"}
                        className={
                          game.phase === "LOBBY"
                            ? "text-cyan-200 uppercase tracking-[0.12em]"
                            : "uppercase tracking-[0.12em]"
                        }
                      >
                        {game.phase}
                      </InfoChip>
                    </td>
                    <td className={tableCellClass}>
                      {game.allowSpectators ? (
                        <InfoChip size="xs" className="text-cyan-200">
                          Allowed
                        </InfoChip>
                      ) : (
                        <InfoChip size="xs" variant="muted">
                          Off
                        </InfoChip>
                      )}
                    </td>
                    <td className={tableCellClass}>
                      {game.phase === "LOBBY" &&
                        game.joinedPlayers < game.maxPlayers && (
                          <button
                            className={`${actionButtonClass} mr-2`}
                            onClick={() => onJoin(game.id)}
                          >
                            Join
                          </button>
                        )}

                      {game.phase === "PLAY" && game.allowSpectators && (
                        <button
                          className={actionButtonClass}
                          onClick={() => onSpectate(game.id)}
                        >
                          Spectate
                        </button>
                      )}

                      {game.phase === "PLAY" && !game.allowSpectators && (
                        <span className="text-gray-400">Full</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <BackButton onClick={onBack} className="mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
