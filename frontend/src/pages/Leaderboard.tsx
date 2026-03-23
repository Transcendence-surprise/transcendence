import { mockLeaderboard } from "../types/mockPlayer";

export default function Leaderboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-4xl font-bold mb-8 text-white">Leaderboard</h2>

      <div className="bg-bg-modal rounded-lg border border-[var(--color-border-subtle)] p-4 max-w-4xl w-full">
        {mockLeaderboard.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between py-4 px-4 border-b border-[var(--color-border-gray)] last:border-b-0 hover:bg-white/8 transition"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 flex items-center justify-center min-w-10">
                <span className="text-cyan-bright font-bold text-lg">
                  {index + 1}
                </span>
              </div>
              <img
                src={player.avatar}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover border border-[var(--color-border-subtle)]"
              />
              <div>
                <h3 className="text-white font-semibold">{player.name}</h3>
                <p className="text-sm text-muted-500">Rank {player.rank}</p>
              </div>
            </div>

            <div className="flex gap-8 items-center">
              <div className="text-center">
                <p className="text-yellow-400 font-bold text-lg">
                  {player.totalWins}
                </p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-cyan-400 font-bold text-lg">
                  {player.totalMatches}
                </p>
                <p className="text-xs text-gray-400">Matches</p>
              </div>
              <div className="text-center">
                <p className="text-green-400 font-bold text-lg">
                  {player.winrate}%
                </p>
                <p className="text-xs text-gray-400">Win Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
