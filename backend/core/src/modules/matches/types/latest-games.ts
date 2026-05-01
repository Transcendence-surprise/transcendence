export interface LatestGames {
  result: string;
  opponents: string[];
  createdAt: string;
}

export type RawLatestGameRow = {
  winnerId: string | number | null;
  opponents: Array<string | null> | null;
  createdAt: string;
};