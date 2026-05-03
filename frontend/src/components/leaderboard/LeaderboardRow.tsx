import type { LeaderboardEntry } from "../../api/leaderboard";
import { getMockAvatarSrc } from "../../types/mockPlayer";

interface LeaderboardRowProps {
  player: LeaderboardEntry;
  fallbackRank: number;
  currentUserId?: number | string;
}

export default function LeaderboardRow({
  player,
  fallbackRank,
  currentUserId,
}: LeaderboardRowProps) {
  const username = player.username ?? `User #${player.userId}`;
  const winRate =
    player.totalGames > 0
      ? Math.round((player.wins / player.totalGames) * 100)
      : 0;
  const rank = player.rank || fallbackRank;
  const isCurrentUser =
    currentUserId != null && String(currentUserId) === String(player.userId);

  const rankClassName =
    rank === 1
      ? "text-yellow-300"
      : rank === 2
        ? "text-slate-200"
        : rank === 3
          ? "text-amber-500"
          : "text-cyan-bright";

  const rowClassName = isCurrentUser
    ? "bg-cyan-500/6 ring-1 ring-inset ring-cyan-400/40"
    : "";
  return (
    <div
      className={`flex flex-col gap-4 border-b border-[var(--color-border-gray)] px-4 py-4 transition hover:bg-white/8 last:border-b-0 md:flex-row md:items-center md:justify-between ${rowClassName}`.trim()}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <div className="flex h-10 w-10 min-w-10 items-center justify-center">
          <span className={`text-lg font-bold ${rankClassName}`.trim()}>
            {rank}
          </span>
        </div>
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={username}
            className="h-12 w-12 rounded-full border border-[var(--color-border-subtle)] object-cover"
          />
        ) : (
          <img
            src={getMockAvatarSrc(`user-${player.userId}`)}
            alt={`${username} avatar`}
            className="h-12 w-12 rounded-full border border-[var(--color-border-subtle)] bg-black/15 object-cover"
          />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white sm:text-base">
              {username}
            </h3>
            {isCurrentUser ? (
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                You
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-gray-400 sm:text-xs">
            Win streak: {player.winStreak}
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-2 sm:gap-4 md:w-auto md:flex md:items-center md:gap-8">
        <div className="text-center">
          <p className="text-base font-bold text-yellow-400 sm:text-lg">
            {player.wins}
          </p>
          <p className="text-[11px] text-gray-400 sm:text-xs">Wins</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-cyan-400 sm:text-lg">
            {player.totalGames}
          </p>
          <p className="text-[11px] text-gray-400 sm:text-xs">Matches</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-green-400 sm:text-lg">
            {winRate}%
          </p>
          <p className="text-[11px] text-gray-400 sm:text-xs">Win Rate</p>
        </div>
      </div>
    </div>
  );
}
