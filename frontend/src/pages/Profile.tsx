import StatCard from "../components/UI/StatCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { getUserBadges, type UserBadge } from "../api/badges";
import { getUserLatestGames, type LatestGames } from "../api/matches";
import { getUserRanking } from "../api/leaderboard";
import { uploadMyAvatar } from "../api/users";
import { FiEdit2 } from "react-icons/fi";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username ?? "Player";
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const rankNumber = userRanking ?? user?.rankNumber ?? 0;
  const winStreak = user?.winStreak ?? 0;
  const totalGames = user?.totalGames ?? 0;
  const totalWins = user?.totalWins ?? 0;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const [unlockedBadges, setUnlockedBadges] = useState<UserBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [latestGames, setLatestGames] = useState<LatestGames[]>([]);
  const [latestGamesLoading, setLatestGamesLoading] = useState(false);
  const [latestGamesError, setLatestGamesError] = useState<string | null>(null);
  const userId = user?.id;
  const isGuest = !user || user.roles.includes("guest");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const DEFAULT_AVATAR = "/assets/profile_icon.svg";
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(0);
  const avatarUrlFromUser = user?.avatarUrl ?? null;
  // If we have a server-provided avatar URL, append timestamp to bust cache when needed.
  const avatarSrcFromServer =
    avatarUrlFromUser && avatarTimestamp
      ? `${avatarUrlFromUser}?t=${avatarTimestamp}`
      : avatarUrlFromUser ?? null;
  const avatarSrc = avatarPreviewUrl ?? avatarSrcFromServer ?? DEFAULT_AVATAR;
  // console.log("avatarUrl from user:", user?.avatarUrl);
  // console.log("avatarSrc used:", avatarSrc);

  useEffect(() => {
    // Cleanup object URL when leaving the page or selecting another image.
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const handleAvatarSelect = (file: File | null) => {
  setAvatarError(null);

  if (avatarPreviewUrl) {
    try {
      URL.revokeObjectURL(avatarPreviewUrl);
    } catch {}
    setAvatarPreviewUrl(null);
  }

  setAvatarFile(file);

  if (!file) return;

  const preview = URL.createObjectURL(file);
  setAvatarPreviewUrl(preview);
  // auto-upload immediately for better UX
  // call upload with the selected file directly to avoid waiting for state
  void handleAvatarUpload(file);
};

const handleAvatarUpload = async (file?: File | null) => {
  const fileToUpload = file ?? avatarFile;
  if (!fileToUpload) return;

  setAvatarUploading(true);
  setAvatarError(null);

  try {
  await uploadMyAvatar(fileToUpload);
    await refreshUser();

  // update timestamp so browser requests the fresh file instead of cached image
  setAvatarTimestamp(Date.now());

    if (avatarPreviewUrl) {
      try {
        URL.revokeObjectURL(avatarPreviewUrl);
      } catch {}
    }

    setAvatarPreviewUrl(null);
    setAvatarFile(null);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload avatar";
    setAvatarError(message);
  } finally {
    setAvatarUploading(false);
  }
};

  useEffect(() => {
    if (isGuest) return;

    refreshUser().catch(() => {
      // Ignore transient refresh errors; UI can still render existing context state
    });

    const onFocus = () => {
      refreshUser().catch(() => {
        // Ignore transient refresh errors on focus refresh
      });
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isGuest, userId, refreshUser]);

  useEffect(() => {
    if (isGuest) return;

    const controller = new AbortController();

    const loadUserRanking = async () => {
      try {
        const ranking = await getUserRanking(controller.signal);
        setUserRanking(ranking);
      } catch (error) {
        if (controller.signal.aborted) return;
        setUserRanking(null);
      }
    };

    loadUserRanking();

    return () => controller.abort();
  }, [isGuest, userId]);

  useEffect(() => {
    if (isGuest) return;

    const controller = new AbortController();

    const loadBadges = async () => {
      try {
        setBadgesLoading(true);
        setBadgesError(null);
        const badges = await getUserBadges(controller.signal);
        setUnlockedBadges(badges);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Failed to load badges";
        setBadgesError(message);
      } finally {
        if (!controller.signal.aborted) {
          setBadgesLoading(false);
        }
      }
    };

    loadBadges();

    return () => controller.abort();
  }, [isGuest, userId]);

  useEffect(() => {
    if (isGuest) return;

    const controller = new AbortController();

    const loadLatestGames = async () => {
      try {
        setLatestGamesLoading(true);
        setLatestGamesError(null);
        const games = await getUserLatestGames(controller.signal);
        setLatestGames(games ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Failed to load recent games";
        setLatestGamesError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLatestGamesLoading(false);
        }
      }
    };

    loadLatestGames();

    return () => controller.abort();
  }, [isGuest, userId]);

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">
          Login required to access profile
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="py-3 px-6 rounded-lg font-medium text-white bg-bg-dark-tertiary border border-[var(--color-border-subtle)] hover:shadow-cyan-light hover:border-cyan-bright transition-all"
        >
          Back
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative shrink-0">
          <img
            src={avatarSrc}
            alt={displayName}
            onError={(e) => {
              // If the image fails to load (missing upload, cleared uploads dir, etc.),
              // fallback to the default avatar to avoid a persistent broken image/404.
              // Compare the literal attribute value (not the resolved absolute URL).
              const img = e.currentTarget as HTMLImageElement;
              if (img.getAttribute('src') !== DEFAULT_AVATAR) {
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
        ) : unlockedBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.key}
                className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-modal p-3 flex flex-col items-center text-center gap-2"
              >
                <img src={badge.imageUrl} alt={badge.name} className="w-16 h-16" />
                <p className="text-sm text-white">{badge.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No badges unlocked yet.</p>
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
            latestGames.slice(0, 4).map((game, index) => (
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
