export interface StartResult {
  ok: boolean;
  error?: StartError;
}

export enum StartError {
  NOT_HOST = "NOT_HOST",
  NOT_ENOUGH_PLAYERS = "NOT_ENOUGH_PLAYERS",
  ALREADY_STARTED = "ALREADY_STARTED",
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
}