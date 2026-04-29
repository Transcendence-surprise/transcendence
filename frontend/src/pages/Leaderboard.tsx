import { useEffect, useState } from "react";
import {
  getAllTimeLeaderboard,
  getUserRanking,
  type LeaderboardEntry,
} from "../api/leaderboard";
import { useAuth } from "../hooks/useAuth";

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const leaderboardPromise = getAllTimeLeaderboard(controller.signal);
        const rankingPromise =
          user && !user.roles.includes("guest")
            ? getUserRanking(controller.signal)
            : Promise.resolve(null);

        const [leaderboard, ranking] = await Promise.all([
          leaderboardPromise,
          rankingPromise,
        ]);

        if (controller.signal.aborted) return;

        setEntries(leaderboard);
        setUserRanking(ranking);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load leaderboard.";
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadLeaderboard();

    return () => controller.abort();
  }, [user]);

  return (
    <div className="flex flex-col">
      <h2 className="text-4xl font-bold mb-8 text-white">Leaderboard</h2>

      <div className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-bg-modal">
        {userRanking !== null ? (
          <div className="m-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            Your current multiplayer rank:{" "}
            <span className="font-bold text-cyan-bright">#{userRanking}</span>
          </div>
        ) : null}

        {loading ? (
          <p className="px-4 py-6 text-sm text-gray-400">Loading leaderboard...</p>
        ) : error ? (
          <p className="px-4 py-6 text-sm text-red-300">{error}</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">No leaderboard data yet.</p>
        ) : (
          entries.map((player, index) => {
            const username = player.username ?? `User #${player.userId}`;
            const winRate =
              player.totalGames > 0
                ? Math.round((player.wins / player.totalGames) * 100)
                : 0;

            return (
              <div
                key={player.userId}
                className="flex flex-col gap-4 border-b border-[var(--color-border-gray)] px-4 py-4 transition hover:bg-white/8 last:border-b-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 min-w-10 items-center justify-center">
                    <span className="text-lg font-bold text-cyan-bright">
                      {player.rank || index + 1}
                    </span>
                  </div>
                  {player.avatarUrl ? (
                    <img
                      src={player.avatarUrl}
                      alt={username}
                      className="h-12 w-12 rounded-full border border-[var(--color-border-subtle)] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-black/40 text-sm font-semibold text-cyan-200">
                      {username.trim().charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <h3 className="truncate font-semibold text-white">
                      {username}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Win streak: {player.winStreak}
                    </p>
                  </div>
                </div>

                <div className="grid w-full grid-cols-3 gap-4 md:w-auto md:flex md:items-center md:gap-8">
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-400">
                      {player.wins}
                    </p>
                    <p className="text-xs text-gray-400">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-cyan-400">
                      {player.totalGames}
                    </p>
                    <p className="text-xs text-gray-400">Matches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">
                      {winRate}%
                    </p>
                    <p className="text-xs text-gray-400">Win Rate</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
