export type LobbyMessage = {
  userId?: string | number;
  avatarUrl?: string | null;
  userName: string;
  message: string;
  timestamp: number;
};
