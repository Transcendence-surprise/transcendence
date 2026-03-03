
// Match type enum
export enum MatchType {
  SOLO = "Solo",
  VS_PLAYER = "Vs Player",
  TOURNAMENT = "Tournament",
}

// Recent match info
export interface RecentMatch {
  id: string;
  matchType: MatchType;
  opponent?: {
    name: string;
    rank: string;
  };
  playerScore: number;
  opponentScore?: number;
  result: "Win" | "Loss" | "Draw";
  date: Date;
}

// Player profile structure
export interface PlayerProfile {
  id: string;
  name: string;
  rank: string;
  winrate: number; // percentage 0-100
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  recentMatches: RecentMatch[];
}

// Mock data example
export const mockPlayerProfile: PlayerProfile = {
  id: "1",
  name: "ShadowNinja42",
  rank: "#5",
  winrate: 67.5,
  totalMatches: 120,
  totalWins: 81,
  totalLosses: 35,
  totalDraws: 4,
  recentMatches: [
    {
      id: "m1",
      matchType: MatchType.VS_PLAYER,
      opponent: {
        name: "PhoenixRise",
        rank: "#12",
      },
      playerScore: 3,
      opponentScore: 1,
      result: "Win",
      date: new Date("2026-03-02"),
    },
    {
      id: "m2",
      matchType: MatchType.SOLO,
      playerScore: 2850,
      result: "Win",
      date: new Date("2026-03-01"),
    },
    {
      id: "m3",
      matchType: MatchType.VS_PLAYER,
      opponent: {
        name: "IceStorm",
        rank: "#8",
      },
      playerScore: 2,
      opponentScore: 3,
      result: "Loss",
      date: new Date("2026-02-28"),
    },
    {
      id: "m4",
      matchType: MatchType.VS_PLAYER,
      opponent: {
        name: "IceStorm",
        rank: "#8",
      },
      playerScore: 5,
      opponentScore: 3,
      result: "Win",
      date: new Date("2026-02-27"),
    },
    {
      id: "m5",
      matchType: MatchType.VS_PLAYER,
      opponent: {
        name: "CrimsonKnight",
        rank: "#1",
      },
      playerScore: 1,
      opponentScore: 3,
      result: "Loss",
      date: new Date("2026-02-25"),
    },
  ],
};
