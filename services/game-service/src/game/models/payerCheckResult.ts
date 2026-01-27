export interface PlayerCheckResult {
  ok: boolean;
  gameId?: string;
  phase?: "LOBBY" | "PLAY" | "END";
  error?: PlayerCheckError;
}

export enum PlayerCheckError {
  PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND",
}