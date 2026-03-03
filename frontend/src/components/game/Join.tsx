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
    "px-4 py-1 rounded border border-cyan-300/30 bg-[#0B2A30] text-cyan-100 hover:bg-[#11414A] transition-colors";
  const tableHeadClass = "p-3 border-b border-[#FFFFFF1A] text-[#7BE9FF]";
  const tableCellClass = "p-3 border-b border-[#FFFFFF1A]";

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-black text-[#00eaff] font-mono flex items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.25),transparent_55%)] blur-2xl" />
          <div className="relative rounded-2xl border border-[#FFFFFF1A] bg-[#0B0B0F] px-8 py-10 text-center shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
            <p className="text-xs uppercase tracking-[0.4em] text-[#7BE9FF]">
              Lobby Browser
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              No Active Games
            </h2>
            <p className="mt-2 text-sm text-[#B7F6FF]">
              Start a new lobby or try again later.
            </p>
            <button
              className="mt-6 text-sm underline text-blue-300"
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
    <div className="min-h-screen bg-black text-[#00eaff] font-mono flex items-start justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl">
        <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.25),transparent_55%)] blur-2xl" />

        <div className="relative rounded-2xl border border-[#FFFFFF1A] bg-[#0B0B0F] px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-[#7BE9FF]">
              Lobby Browser
            </p>
            <h2 className="text-4xl font-bold drop-shadow-lg text-white">
              Join Multiplayer Game
            </h2>
            <p className="text-sm text-[#B7F6FF] text-center max-w-md">
              Pick a lobby to join or spectate.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left border border-[#FFFFFF1A] rounded-lg overflow-hidden">
              <thead className="bg-[#101019]">
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
                  <tr key={game.id} className="odd:bg-[#0E0E14]">
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
