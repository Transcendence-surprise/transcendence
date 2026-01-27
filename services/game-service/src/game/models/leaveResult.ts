export interface LeaveResult {
  ok: boolean;
  error?: LeaveError;
  deleteGame?: boolean;
}

export enum LeaveError {
  PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND",
  HOST_CANNOT_LEAVE = "HOST_CANNOT_LEAVE",
  GAME_NOT_FOUND = "GAME_NOT_FOUND"
}