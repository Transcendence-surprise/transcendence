export type RawLeaderboardRow = {
  userId: string | number | null;
  username: string | null;
  winStreak: string | number | null;
  avatarImageId: string | number | null;
  wins: string | number;
  totalGames: string | number;
  rank: string | number;
};
