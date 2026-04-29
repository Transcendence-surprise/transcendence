import { useEffect, useState } from "react";
import {
  getAllTimeLeaderboard,
  getUserRanking,
  type LeaderboardEntry,
} from "../api/leaderboard";
import LeaderboardRow from "../components/leaderboard/LeaderboardRow";
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
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white">Leaderboard</h2>
        <p className="mt-2 text-sm text-light-cyan">
          Ranked by total wins in completed multiplayer games.
        </p>
      </div>

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
          entries.map((player, index) => (
            <LeaderboardRow
              key={player.userId}
              player={player}
              fallbackRank={index + 1}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
