// src/components/game/JoinOrCreateTable.tsx
import { MultiGame } from "../../game/models/multiGames";

type Props = {
  games: MultiGame[];
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
  onBack: () => void;
};

export default function JoinTable({
  games,
  onJoin,
  onSpectate,
  onBack,
}: Props) {
  const actionButtonClass =
    "px-4 py-1 rounded border border-cyan-300/30 bg-button-cyan-bg text-white hover:bg-button-cyan-hover transition-colors";
  const tableHeadClass = "p-3 border-b border-[var(--color-border-gray)] text-light-cyan";
  const tableCellClass = "p-3 border-b border-[var(--color-border-gray)]";

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-bg-dark text-cyan-bright font-sans flex items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.25),transparent_55%)] blur-2xl" />
          <div className="relative rounded-2xl border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-8 py-10 text-center shadow-dark-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-light-cyan">
              Lobby Browser
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              No Active Games
            </h2>
            <p className="mt-2 text-sm text-lightest-cyan">
              Start a new lobby or try again later.
            </p>
            <button
              className="mt-6 text-sm underline text-blue-hero"
              onClick={onBack}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-cyan-bright font-sans flex items-start justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl">
        <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.25),transparent_55%)] blur-2xl" />

        <div className="relative rounded-2xl border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-6 py-8 shadow-dark-lg">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-light-cyan">
              Lobby Browser
            </p>
            <h2 className="text-4xl font-bold drop-shadow-lg text-white">
              Join Multiplayer Game
            </h2>
            <p className="text-sm text-lightest-cyan text-center max-w-md">
              Pick a lobby to join or spectate.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left border border-[var(--color-border-subtle)] rounded-lg overflow-hidden">
              <thead className="bg-bg-dark">
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
                  <tr key={game.id} className="odd:bg-bg-dark-secondary">
                    <td className={tableCellClass}>{game.hostId}</td>
                    <td className={tableCellClass}>{game.joinedPlayers}</td>
                    <td className={tableCellClass}>{game.maxPlayers}</td>
                    <td className={tableCellClass}>{game.phase}</td>
                    <td className={tableCellClass}>
                      {game.allowSpectators ? "Yes" : "No"}
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
            <button
              className="text-sm underline text-blue-300"
              onClick={onBack}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
