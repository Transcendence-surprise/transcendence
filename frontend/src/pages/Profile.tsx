import { mockPlayerProfile } from "../types/player";
import StatCard from "../components/UI/StatCard";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const displayName = user?.username ?? mockPlayerProfile.name;

  return (
    <div className="flex flex-col min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        <img
          src={mockPlayerProfile.avatar}
          alt={displayName}
          className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
        />
        <div>
          <h2 className="text-4xl font-bold text-[#ffffff]">{displayName}</h2>
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

      {/* Recent Matches */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Recent Games</h3>
        <div className="bg-[#1A1A1F99] rounded-lg border border-[#FFFFFF1A] p-4 max-w-2xl">
          {mockPlayerProfile.recentGames.slice(0, 4).map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between py-3 border-b border-[#FFFFFF0A] last:border-b-0"
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
