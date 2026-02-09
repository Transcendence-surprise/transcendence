export enum JoinError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  GAME_ALREADY_STARTED = "GAME_ALREADY_STARTED",
  PLAYER_ALREADY_JOINED = "PLAYER_ALREADY_JOINED",
  GAME_FULL = "GAME_FULL",
  SPECTATORS_NOT_ALLOWED = "SPECTATORS_NOT_ALLOWED"
}

export type JoinResult =
  | { ok: true; role: "PLAYER" | "SPECTATOR" }
  | { ok: false; error: JoinError };