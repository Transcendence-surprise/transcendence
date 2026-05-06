import StatCard from "../components/UI/StatCard";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import { useAvatar } from "../hooks/useAvatar";
import BackButton from "../components/shared/BackButton";

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuth().user;
  const isGuest = !user || user.roles.includes("guest");

  const {
    displayName,
    userRanking: rankNumber,
    winStreak,
    totalGames,
    totalWins,
    winRate,
    userBadges,
    badgesLoading,
    badgesError,
    latestGames,
    latestGamesLoading,
    latestGamesError,
  } = useProfile();

  const {
    avatarSrc,
    avatarUploading,
    avatarError,
    avatarPreviewUrl,
    handleAvatarSelect,
    fileInputRef,
    DEFAULT_AVATAR,
  } = useAvatar(user?.avatarUrl ?? null);

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">
          Login required to access profile
        </h2>

        <BackButton onClick={() => navigate(-1)} variant="outline" />
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative shrink-0">
          <img
            src={avatarSrc}
            alt={displayName}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.getAttribute("src") !== DEFAULT_AVATAR) {
                img.onerror = null;
                img.src = DEFAULT_AVATAR;
              }
            }}
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
          />

          <button
            type="button"
            aria-label="Edit avatar"
            aria-busy={avatarUploading}
            onClick={() => {
              if (!avatarUploading) {
                fileInputRef.current?.click();
              }
            }}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 -mb-1 -mr-1 bg-bg-dark-tertiary p-1.5 rounded-full border border-[var(--color-border-subtle)] hover:bg-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiEdit2 className="w-4 h-4 text-cyan-300" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
            disabled={avatarUploading}
          />

          {avatarPreviewUrl ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-300">Preparing upload...</span>
              <button
                type="button"
                onClick={() => handleAvatarSelect(null)}
                disabled={avatarUploading}
                className="px-3 py-1.5 rounded-md text-sm font-bold border border-[var(--color-border-subtle)] text-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          ) : null}
          {avatarError ? (
            <p className="text-xs text-red-400 mt-2 max-w-[14rem]">{avatarError}</p>
          ) : null}
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white">{displayName}</h2>
          <p className="text-base text-gray-400 mt-1">
            Rank {rankNumber} • {winStreak} wins
            streak
          </p>
          {user?.avatarUrl ? (
            <p className="text-sm mt-2">
              <a
                href={`${user.avatarUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline"
              >
                Open uploaded image
              </a>
            </p>
          ) : null}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
        <StatCard
          icon={
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="Total Games"
          value={totalGames}
        />

        <StatCard
          icon={
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          }
          title="Total Wins"
          value={totalWins}
        />

        <StatCard
          icon={
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          title="Winrate"
          value={`${winRate}%`}
        />
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Badges</h3>
        {badgesLoading ? (
          <p className="text-sm text-gray-400">Loading badges...</p>
        ) : badgesError ? (
          <p className="text-sm text-red-400">{badgesError}</p>
        ) : userBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl">
            {userBadges.map((badge) => {
              const progress = badge.progress;
              const target = badge.target;
              const progressPercent = Math.round((progress / target) * 100);

              return (
                <div
                  key={badge.key}
                  className={`rounded-lg border p-3 flex flex-col items-center text-center gap-2 ${
                    badge.completed
                      ? "border-cyan-500/60 bg-bg-modal"
                      : "border-[var(--color-border-subtle)] bg-bg-modal"
                  }`}
                >
                  <img src={badge.imageUrl} alt={badge.name} className="w-16 h-16" />
                  <p className="text-sm text-white font-semibold">{badge.name}</p>
                  <p className="text-xs text-gray-400 min-h-8">{badge.description}</p>

                  <div className="w-full">
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>
                        {progress}/{target}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-dark-tertiary overflow-hidden">
                      <div
                        className={`h-full ${badge.completed ? "bg-cyan-400" : "bg-blue-400"}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {badge.completed ? (
                    <p className="text-[11px] text-cyan-300">
                      Unlocked{badge.unlockedAt ? ` • ${new Date(badge.unlockedAt).toLocaleDateString()}` : ""}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500">In progress</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No badge progress yet.</p>
        )}
      </div>

      {/* Recent Matches */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Recent Games</h3>
        <div className="bg-bg-modal rounded-lg border border-[var(--color-border-subtle)] p-4 max-w-2xl">
          {latestGamesLoading ? (
            <p className="text-sm text-gray-400">Loading recent games...</p>
          ) : latestGamesError ? (
            <p className="text-sm text-red-400">{latestGamesError}</p>
          ) : latestGames.length > 0 ? (
            latestGames.slice(0, 7).map((game, index) => (
              <div
                key={`${game.createdAt}-${index}`}
                className="flex items-center justify-between py-3 border-b border-[var(--color-border-gray)] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      game.result === "win"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {game.result === "win" ? "Win" : "Lose"}
                  </span>
                  <span className="text-gray-300">
                    vs {game.opponents?.length ? game.opponents.join(", ") : "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(game.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No recent games yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
