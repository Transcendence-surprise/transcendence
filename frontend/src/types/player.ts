// Recent match info
export interface RecentMatch {
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
  winrate: number; // percentage 0-100
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  recentMatches: RecentMatch[];
}

// Mock data example
export const mockPlayerProfile: PlayerProfile = {
  id: "1",
  name: "ShadowNinja42",
  avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=Felix",
  rank: "#5",
  winstreak: 3,
  winrate: 67.5,
  totalMatches: 120,
  totalWins: 81,
  totalLosses: 35,
  recentMatches: [
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
