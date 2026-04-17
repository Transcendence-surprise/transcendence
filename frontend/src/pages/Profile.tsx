import { mockPlayerProfile } from "../types/mockPlayer";
import StatCard from "../components/UI/StatCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username ?? mockPlayerProfile.name;
  const totalMatches = mockPlayerProfile.totalMatches;
  const badges = [
    {
      id: "first-login",
      name: "First login",
      image: "/assets/badges/badge_first_login.svg",
      unlocked: true,
    },
    {
      id: "first-game",
      name: "First game",
      image: "/assets/badges/badge_first_game.svg",
      unlocked: totalMatches >= 1,
    },
    {
      id: "first-friend",
      name: "First friend",
      image: "/assets/badges/badge_first_friend.svg",
      unlocked: true,
    },
    {
      id: "games-20",
      name: "20 games played",
      image: "/assets/badges/badge_20_games.svg",
      unlocked: totalMatches >= 20,
    },
    {
      id: "games-50",
      name: "50 games played",
      image: "/assets/badges/badge_50_games.svg",
      unlocked: totalMatches >= 50,
    },
  ];
  const unlockedBadges = badges.filter((badge) => badge.unlocked);

  if (!user || user.roles.includes("guest")) {
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
        <img
          src={mockPlayerProfile.avatar}
          alt={displayName}
          className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
        />
        <div>
          <h2 className="text-4xl font-bold text-white">{displayName}</h2>
          <p className="text-base text-gray-400 mt-1">
            Rank {mockPlayerProfile.rank} • {mockPlayerProfile.winstreak} wins
            streak
          </p>
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
          value={mockPlayerProfile.totalMatches}
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
          value={mockPlayerProfile.totalWins}
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
          value={`${mockPlayerProfile.winrate}%`}
        />
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Badges</h3>
        {unlockedBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-modal p-3 flex flex-col items-center text-center gap-2"
              >
                <img src={badge.image} alt={badge.name} className="w-16 h-16" />
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
          {mockPlayerProfile.recentGames.slice(0, 4).map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between py-3 border-b border-[var(--color-border-gray)] last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    match.result === "Win"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {match.result}
                </span>
                <span className="text-gray-300">vs {match.opponent.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {match.date.toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
