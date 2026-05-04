// Recent match info
export interface RecentGame {
  id: string;
  opponent: {
    name: string;
    rank: string;
  };
  result: "Win" | "Loss";
  date: Date;
}

// Player profile structure
export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  rank: string;
  winstreak: number;
  winrate: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  recentGames: RecentGame[];
}

export function getMockAvatarSrc(seed: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

// Mock data example
export const mockPlayerProfile: PlayerProfile = {
  id: "1",
  name: "ShadowNinja42",
  avatar: getMockAvatarSrc("Felix"),
  rank: "#5",
  winstreak: 3,
  winrate: 67.5,
  totalMatches: 120,
  totalWins: 81,
  totalLosses: 35,
  recentGames: [
    {
      id: "m1",
      opponent: {
        name: "PhoenixRise",
        rank: "#12",
      },
      result: "Win",
      date: new Date("2026-03-02"),
    },
    {
      id: "m2",
      opponent: {
        name: "IceStorm",
        rank: "#8",
      },
      result: "Loss",
      date: new Date("2026-03-01"),
    },
    {
      id: "m3",
      opponent: {
        name: "IceStorm",
        rank: "#8",
      },
      result: "Loss",
      date: new Date("2026-02-28"),
    },
    {
      id: "m4",
      opponent: {
        name: "IceStorm",
        rank: "#8",
      },
      result: "Win",
      date: new Date("2026-02-27"),
    },
    {
      id: "m5",
      opponent: {
        name: "CrimsonKnight",
        rank: "#1",
      },
      result: "Loss",
      date: new Date("2026-02-25"),
    },
  ],
};

// Mock leaderboard data sorted by wins
export const mockLeaderboard: PlayerProfile[] = [
  {
    id: "1",
    name: "CrimsonKnight",
    avatar: getMockAvatarSrc("Crimson"),
    rank: "#1",
    winstreak: 8,
    winrate: 82.5,
    totalMatches: 200,
    totalWins: 165,
    totalLosses: 35,
    recentGames: [],
  },
  {
    id: "2",
    name: "IceStorm",
    avatar: getMockAvatarSrc("Ice"),
    rank: "#2",
    winstreak: 5,
    winrate: 75.3,
    totalMatches: 186,
    totalWins: 140,
    totalLosses: 46,
    recentGames: [],
  },
  {
    id: "3",
    name: "PhoenixRise",
    avatar: getMockAvatarSrc("Phoenix"),
    rank: "#3",
    winstreak: 3,
    winrate: 70.8,
    totalMatches: 152,
    totalWins: 108,
    totalLosses: 44,
    recentGames: [],
  },
  {
    id: "4",
    name: "ShadowNinja42",
    avatar: getMockAvatarSrc("Felix"),
    rank: "#4",
    winstreak: 3,
    winrate: 67.5,
    totalMatches: 120,
    totalWins: 81,
    totalLosses: 35,
    recentGames: [],
  },
  {
    id: "5",
    name: "VortexEcho",
    avatar: getMockAvatarSrc("Vortex"),
    rank: "#5",
    winstreak: 2,
    winrate: 62.1,
    totalMatches: 97,
    totalWins: 60,
    totalLosses: 37,
    recentGames: [],
  },
  {
    id: "6",
    name: "LunarEclipse",
    avatar: getMockAvatarSrc("Lunar"),
    rank: "#6",
    winstreak: 4,
    winrate: 58.9,
    totalMatches: 123,
    totalWins: 52,
    totalLosses: 71,
    recentGames: [],
  },
  {
    id: "7",
    name: "ThunderStrike",
    avatar: getMockAvatarSrc("Thunder"),
    rank: "#7",
    winstreak: 1,
    winrate: 55.2,
    totalMatches: 105,
    totalWins: 38,
    totalLosses: 67,
    recentGames: [],
  },
  {
    id: "8",
    name: "SilentHero",
    avatar: getMockAvatarSrc("Silent"),
    rank: "#8",
    winstreak: 2,
    winrate: 51.4,
    totalMatches: 92,
    totalWins: 28,
    totalLosses: 64,
    recentGames: [],
  },
];
