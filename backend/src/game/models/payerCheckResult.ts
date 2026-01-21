export interface PlayerCheckResult {
  ok: boolean;
  error?: PlayerCheckError;
}

export enum PlayerCheckError {
  PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND",
}